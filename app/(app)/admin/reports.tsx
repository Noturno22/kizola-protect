import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Download,
  Share2,
  CheckCircle,
  Users,
  MessageSquare,
  DollarSign
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { supabase } from '@/lib/supabase';

type ReportType = 'users' | 'cases' | 'finance';
type FormatType = 'pdf' | 'excel';

export default function AdminReports() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  const [reportType, setReportType] = useState<ReportType>('users');
  const [format, setFormat] = useState<FormatType>('pdf');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);

      // Fetch data based on type
      let csvContent = '';
      let fileName = `kizola_report_${reportType}_${new Date().toISOString().split('T')[0]}`;

      if (reportType === 'users') {
        const { data: users, error } = await supabase.from('profiles').select('*');
        if (error) throw error;
        
        if (format === 'excel') {
          fileName += '.csv';
          csvContent = 'ID,Nome,Email,Telefone,Status,Data de Criacao\n';
          (users || []).forEach(u => {
            csvContent += `"${u.id}","${u.full_name || ''}","${u.email}","${u.phone || ''}","${u.status || 'inactive'}","${u.created_at}"\n`;
          });
        } else {
          fileName += '.txt';
          csvContent = `==================================================\nKIZOLA PROTECT - RELATÓRIO DE UTILIZADORES\nGerado em: ${new Date().toLocaleString()}\n==================================================\n\n`;
          (users || []).forEach((u, i) => {
            csvContent += `${i + 1}. Nome: ${u.full_name || 'N/A'}\n   Email: ${u.email}\n   Telefone: ${u.phone || 'N/A'}\n   Status: ${u.status || 'inactive'}\n   Data de Adesão: ${new Date(u.created_at).toLocaleDateString()}\n\n`;
          });
        }
      } else if (reportType === 'cases') {
        const { data: cases, error } = await supabase.from('support_requests').select('*');
        if (error) throw error;

        if (format === 'excel') {
          fileName += '.csv';
          csvContent = 'ID,Nome,Email,Categoria,Prioridade,Status,Mensagem,Criado Em\n';
          (cases || []).forEach(c => {
            csvContent += `"${c.id}","${c.name}","${c.email}","${c.category}","${c.priority}","${c.status}","${c.message.replace(/"/g, '""')}","${c.created_at}"\n`;
          });
        } else {
          fileName += '.txt';
          csvContent = `==================================================\nKIZOLA PROTECT - RELATÓRIO DE CASOS DE ATENDIMENTO\nGerado em: ${new Date().toLocaleString()}\n==================================================\n\n`;
          (cases || []).forEach((c, i) => {
            csvContent += `${i + 1}. Cliente: ${c.name} (${c.email})\n   Assunto: ${c.category.toUpperCase()} | Prioridade: ${c.priority.toUpperCase()}\n   Estado: ${c.status.toUpperCase()}\n   Mensagem: "${c.message}"\n   Data: ${new Date(c.created_at).toLocaleString()}\n\n`;
          });
        }
      } else {
        // Finance Report
        const { data: subs, error } = await supabase.from('subscriptions').select('*, profiles(full_name, email)');
        if (error) throw error;

        const prices = { free: 0, basic: 19.99, pro: 34.99, premium: 49.99 };

        if (format === 'excel') {
          fileName += '.csv';
          csvContent = 'ID Assinatura,Cliente,Email,Plano,Preço Mensal,Status,Inicio,Proxima Cobranca\n';
          (subs || []).forEach((s: any) => {
            const price = prices[s.plan_id as keyof typeof prices] || 0;
            csvContent += `"${s.id}","${s.profiles?.full_name || ''}","${s.profiles?.email || ''}","${s.plan_id}","${price}","${s.status}","${s.start_date}","${s.next_billing_date}"\n`;
          });
        } else {
          fileName += '.txt';
          csvContent = `==================================================\nKIZOLA PROTECT - DEMONSTRATIVO FINANCEIRO\nGerado em: ${new Date().toLocaleString()}\n==================================================\n\n`;
          let totalMRR = 0;
          (subs || []).forEach((s: any, i) => {
            const price = prices[s.plan_id as keyof typeof prices] || 0;
            if (s.status === 'active') totalMRR += price;
            csvContent += `${i + 1}. Cliente: ${s.profiles?.full_name || 'N/A'}\n   Email: ${s.profiles?.email || 'N/A'}\n   Plano: ${s.plan_id.toUpperCase()} ($${price.toFixed(2)}/mês)\n   Estado: ${s.status.toUpperCase()}\n   Início: ${new Date(s.start_date).toLocaleDateString()}\n\n`;
          });
          csvContent += `--------------------------------------------------\nMRR Estimado: $${totalMRR.toFixed(2)}\nARR Estimado: $${(totalMRR * 12).toFixed(2)}\n--------------------------------------------------\n`;
        }
      }

      // Write file locally
      const fileUri = `${(FileSystem as any).documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Sucesso', `Ficheiro gerado em: ${fileUri}`);
      }

      // Log in audit log
      try {
        await supabase.from('auth_audit_logs').insert({
          action: 'admin_action',
          resource: 'reports',
          details: { report_type: reportType, format, date_range: dateRange }
        });
      } catch (logErr) {
        console.warn('Failed to insert audit log:', logErr);
      }

    } catch (err: any) {
      Alert.alert('Erro ao Gerar', err.message || 'Ocorreu um erro ao exportar o relatório.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Exportação de Relatórios</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Step 1: Select Type */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Selecione o Tipo de Relatório</Text>
        <View style={styles.optionsGrid}>
          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }, reportType === 'users' && styles.optionCardActive]}
            onPress={() => setReportType('users')}
          >
            <View style={[styles.iconBox, { backgroundColor: theme.accentBlue + '15' }]}>
              <Users size={24} color={theme.accentBlue || '#3B82F6'} />
            </View>
            <Text style={[styles.optionTitle, { color: theme.text }]}>Utilizadores</Text>
            <Text style={[styles.optionDesc, { color: theme.textMuted }]}>Lista de membros, datas de adesão e status.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }, reportType === 'cases' && styles.optionCardActive]}
            onPress={() => setReportType('cases')}
          >
            <View style={[styles.iconBox, { backgroundColor: (theme.accentAmber || '#F59E0B') + '15' }]}>
              <MessageSquare size={24} color={theme.accentAmber || '#F59E0B'} />
            </View>
            <Text style={[styles.optionTitle, { color: theme.text }]}>Casos de Suporte</Text>
            <Text style={[styles.optionDesc, { color: theme.textMuted }]}>Histórico de chamados de ajuda e resoluções.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }, reportType === 'finance' && styles.optionCardActive]}
            onPress={() => setReportType('finance')}
          >
            <View style={[styles.iconBox, { backgroundColor: theme.accentPurple + '15' }]}>
              <DollarSign size={24} color={theme.accentPurple || '#8B5CF6'} />
            </View>
            <Text style={[styles.optionTitle, { color: theme.text }]}>Financeiro</Text>
            <Text style={[styles.optionDesc, { color: theme.textMuted }]}>Status Stripe, assinaturas de planos, MRR/ARR.</Text>
          </TouchableOpacity>
        </View>

        {/* Step 2: Format */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>2. Formato de Exportação</Text>
        <View style={styles.formatRow}>
          <TouchableOpacity
            style={[styles.formatCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }, format === 'pdf' && styles.formatCardActive]}
            onPress={() => setFormat('pdf')}
          >
            <FileText size={20} color={format === 'pdf' ? theme.accent : theme.textSecondary} />
            <Text style={[styles.formatText, { color: theme.text }]}>Documento (PDF/TXT)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.formatCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }, format === 'excel' && styles.formatCardActive]}
            onPress={() => setFormat('excel')}
          >
            <Download size={20} color={format === 'excel' ? theme.accent : theme.textSecondary} />
            <Text style={[styles.formatText, { color: theme.text }]}>Planilha (Excel/CSV)</Text>
          </TouchableOpacity>
        </View>

        {/* Step 3: Date range */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16 }]}>3. Período de Dados</Text>
        <View style={styles.periodRow}>
          <TouchableOpacity
            style={[styles.periodButton, dateRange === '7d' && styles.periodButtonActive]}
            onPress={() => setDateRange('7d')}
          >
            <Text style={[styles.periodText, { color: dateRange === '7d' ? '#FFF' : theme.textSecondary }]}>Últimos 7 dias</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, dateRange === '30d' && styles.periodButtonActive]}
            onPress={() => setDateRange('30d')}
          >
            <Text style={[styles.periodText, { color: dateRange === '30d' ? '#FFF' : theme.textSecondary }]}>Últimos 30 dias</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, dateRange === 'all' && styles.periodButtonActive]}
            onPress={() => setDateRange('all')}
          >
            <Text style={[styles.periodText, { color: dateRange === 'all' ? '#FFF' : theme.textSecondary }]}>Todo Histórico</Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: theme.accent }, generating && styles.generateButtonDisabled]}
          onPress={handleGenerateReport}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Share2 size={20} color="#FFF" />
              <Text style={styles.generateButtonText}>Exportar & Partilhar</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsGrid: {
    gap: 16,
    marginBottom: 20,
  },
  optionCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionCardActive: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  optionDesc: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  formatRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  formatCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  formatCardActive: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  formatText: {
    fontSize: 13,
    fontWeight: '700',
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '700',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
