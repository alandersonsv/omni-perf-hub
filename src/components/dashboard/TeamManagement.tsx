import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Plus, Users, Mail, Shield, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'analyst' | 'viewer';
  permissions: Record<string, boolean>;
  invited_at: string;
  accepted_at?: string;
  status: 'pending' | 'active';
}

const roles = [
  {
    value: 'owner',
    label: 'Proprietário',
    description: 'Acesso total ao sistema',
    color: 'bg-purple-500',
  },
  {
    value: 'admin',
    label: 'Administrador',
    description: 'Gerenciar usuários e configurações',
    color: 'bg-blue-500',
  },
  {
    value: 'analyst',
    label: 'Analista',
    description: 'Criar relatórios e alertas',
    color: 'bg-green-500',
  },
  {
    value: 'viewer',
    label: 'Visualizador',
    description: 'Apenas visualizar dados',
    color: 'bg-gray-500',
  },
];

export function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    role: 'viewer' as TeamMember['role'],
  });

  useEffect(() => {
    // Mock data - replace with actual API call
    setTeamMembers([
      {
        id: '1',
        email: 'admin@agencia.com',
        role: 'owner',
        permissions: {},
        invited_at: '2024-01-15T10:00:00Z',
        accepted_at: '2024-01-15T10:05:00Z',
        status: 'active',
      },
      {
        id: '2',
        email: 'analista@agencia.com',
        role: 'analyst',
        permissions: {},
        invited_at: '2024-01-18T14:30:00Z',
        accepted_at: '2024-01-18T16:45:00Z',
        status: 'active',
      },
      {
        id: '3',
        email: 'cliente@empresa.com',
        role: 'viewer',
        permissions: {},
        invited_at: '2024-01-20T09:15:00Z',
        status: 'pending',
      },
    ]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.role) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Check if email already exists
    if (teamMembers.some(member => member.email === formData.email)) {
      toast({
        title: "Erro",
        description: "Este email já foi convidado.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const newMember: TeamMember = {
        id: Math.random().toString(36).substr(2, 9),
        email: formData.email,
        role: formData.role,
        permissions: {},
        invited_at: new Date().toISOString(),
        status: 'pending',
      };

      setTeamMembers(prev => [...prev, newMember]);
      setIsDialogOpen(false);
      setFormData({ email: '', role: 'viewer' });

      toast({
        title: "Convite enviado",
        description: `Convite enviado para ${formData.email} com perfil ${roles.find(r => r.value === formData.role)?.label}.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o convite.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;

    if (member.role === 'owner') {
      toast({
        title: "Erro",
        description: "Não é possível remover o proprietário.",
        variant: "destructive",
      });
      return;
    }

    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    toast({
      title: "Membro removido",
      description: `${member.email} foi removido da equipe.`,
    });
  };

  const resendInvite = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;

    toast({
      title: "Convite reenviado",
      description: `Novo convite enviado para ${member.email}.`,
    });
  };

  const getRoleInfo = (role: string) => {
    return roles.find(r => r.value === role) || roles[3];
  };

  const getStatusBadge = (member: TeamMember) => {
    if (member.status === 'active') {
      return <Badge className="bg-green-500">Ativo</Badge>;
    }
    return <Badge variant="outline">Pendente</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Equipe</h2>
          <p className="text-muted-foreground">
            Gerencie os membros da sua equipe e suas permissões
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Convidar Membro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Convidar Novo Membro</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="usuario@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Perfil *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as TeamMember['role'] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.filter(role => role.value !== 'owner').map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${role.color}`} />
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-xs text-muted-foreground">{role.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar Convite"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Membros da Equipe ({teamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                const roleInfo = getRoleInfo(member.role);
                
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {member.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${roleInfo.color}`} />
                        <span>{roleInfo.label}</span>
                        {member.role === 'owner' && (
                          <Shield className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(member)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {new Date(member.invited_at).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {member.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resendInvite(member.id)}
                          >
                            Reenviar
                          </Button>
                        )}
                        {member.role !== 'owner' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {teamMembers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Nenhum membro convidado</h3>
              <p className="text-muted-foreground">
                Convide membros para colaborar na sua agência
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          Os membros convidados receberão um email com instruções para acessar a plataforma.
          Eles poderão aceitar o convite e criar sua conta usando o link do email.
        </AlertDescription>
      </Alert>
    </div>
  );
}