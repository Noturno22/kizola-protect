import { FileText, Image as ImageIcon, FileSpreadsheet, Archive, File, Clock, FileCheck, AlertCircle } from 'lucide-react-native';
import type { ComponentType } from 'react';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getFileIcon(type: string): { icon: ComponentType<any>; color: string } {
  const lower = type.toLowerCase();
  if (lower.includes('pdf')) return { icon: FileText, color: '#EF4444' };
  if (lower.includes('image') || lower.includes('png') || lower.includes('jpg') || lower.includes('jpeg') || lower.includes('gif') || lower.includes('webp')) return { icon: ImageIcon, color: '#10B981' };
  if (lower.includes('sheet') || lower.includes('excel') || lower.includes('csv') || lower.includes('xls')) return { icon: FileSpreadsheet, color: '#10B981' };
  if (lower.includes('zip') || lower.includes('rar') || lower.includes('tar') || lower.includes('7z')) return { icon: Archive, color: '#F59E0B' };
  return { icon: File, color: '#6366F1' };
}

export function getDocStatusConfig(status: string, theme: any, t: (key: string) => string) {
  switch (status) {
    case 'verified':
      return { color: theme.success, bg: theme.success + '15', icon: FileCheck, label: t('documents.verified') || 'Verificado' };
    case 'pending':
      return { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', icon: Clock, label: t('documents.pending') || 'Pendente' };
    case 'rejected':
      return { color: theme.error, bg: theme.error + '15', icon: AlertCircle, label: t('documents.rejected') || 'Rejeitado' };
    default:
      return { color: theme.textMuted, bg: theme.background, icon: File, label: t('documents.uploaded') || 'Carregado' };
  }
}

export interface LocalDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  sizeFormatted: string;
  date: string;
  status: 'uploaded' | 'pending' | 'verified' | 'rejected';
  uri?: string;
  filePath?: string;
}
