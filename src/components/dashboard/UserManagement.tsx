import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type TeamMember = Database['public']['Tables']['team_members']['Row'];

export function UserManagement() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({ email: '', role: 'viewer' });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch team members from Supabase
  useEffect(() => {
    fetchTeamMembers();
  }, [user]);

  const fetchTeamMembers = async () => {
    if (!user?.user_metadata?.agency_id) return;
    
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('agency_id', user.user_metadata.agency_id)
        .order('invited_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar membros da equipe",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.user_metadata?.agency_id) return;

    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          agency_id: user.user_metadata.agency_id,
          email: newMember.email,
          role: newMember.role as Database['public']['Enums']['user_role'],
          permissions: {}
        })
        .select()
        .single();

      if (error) throw error;
      
      setTeamMembers([data, ...teamMembers]);
      setNewMember({ email: '', role: 'viewer' });
      setIsDialogOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Convite enviado com sucesso"
      });
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar convite",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      
      setTeamMembers(teamMembers.filter(member => member.id !== memberId));
      toast({
        title: "Sucesso",
        description: "Membro removido com sucesso"
      });
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover membro",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Membros da Equipe
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Convidar Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convidar Novo Membro</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@email.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Perfil</Label>
                  <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Proprietário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="analyst">Analista</SelectItem>
                      <SelectItem value="viewer">Visualizador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Enviar Convite
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertDescription>
              Gerencie os membros da sua equipe. Convite novos membros e defina seus níveis de acesso.
            </AlertDescription>
          </Alert>
          
          {loading ? (
            <p className="text-center text-muted-foreground py-8">
              Carregando membros da equipe...
            </p>
          ) : teamMembers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum membro da equipe ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Convidado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => {
                  const getRoleLabel = (role: string) => {
                    switch (role) {
                      case 'owner': return 'Proprietário';
                      case 'admin': return 'Administrador';
                      case 'analyst': return 'Analista';
                      case 'viewer': return 'Visualizador';
                      default: return role;
                    }
                  };

                  const getRoleColor = (role: string) => {
                    switch (role) {
                      case 'owner': return 'bg-purple-100 text-purple-800';
                      case 'admin': return 'bg-blue-100 text-blue-800';
                      case 'analyst': return 'bg-green-100 text-green-800';
                      case 'viewer': return 'bg-gray-100 text-gray-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };

                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(member.role || 'viewer')}`}>
                          {getRoleLabel(member.role || 'viewer')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          member.accepted_at 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {member.accepted_at ? 'Ativo' : 'Pendente'}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(member.invited_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleDeleteMember(member.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          Os usuários criados aqui receberão acesso à plataforma por email. 
          A senha inicial será definida no primeiro acesso.
        </AlertDescription>
      </Alert>
    </div>
  );
}