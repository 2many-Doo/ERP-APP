import * as XLSX from 'xlsx';
import { Property } from '@/components/admin/property/types';

export const exportPropertiesToExcel = (properties: Property[], filename: string = 'Талбайн_мэдээлэл') => {
  // Prepare data for Excel
  const excelData = properties.map((property) => ({
    'ID': property.id,
    'Талбайн дугаар': property.number || '',
    'Нэр': property.name || '',
    'Тайлбар': property.description || '',
    'X координат': property.x ?? '',
    'Y координат': property.y ?? '',
    'Урт (м)': property.length ?? '',
    'Өргөн (м)': property.width ?? '',
    'Талбайн хэмжээ (м²)': property.area_size ?? '',
    'Блокийн нэр': property.block?.name || '',
    'Түрээслэгчийн нэр': property.tenant?.name || '',
    'Түрээслэгчийн утас': property.tenant?.phone || '',
    'Түрээслэгчийн имэйл': property.tenant?.email || '',
    'Түрээслэгчийн хаяг': property.tenant?.address || '',
    'Талбайн төрөл': property.type?.name || '',
    'type_id': property.type_id ?? '',
    'Барааны төрөл': property.product_type?.name || '',
    'product_type_id': property.product_type_id ?? property.product_type?.id ?? '',
    'Төлөв': property.status?.name || property.status?.description || '',
    'Үнэлгээний он': property.rate?.year || '',
    'Үнэ (₮)': property.rate?.rate || '',
    'Төлбөр (₮)': property.rate?.fee || '',
    'Эхлэх огноо': property.rate?.start_date ? property.rate.start_date.split(' ')[0] : '',
    'Дуусах огноо': property.rate?.end_date ? property.rate.end_date.split(' ')[0] : '',
    'Үүсгэсэн огноо': property.created_at ? property.created_at.split(' ')[0] : '',
    'Шинэчлэгдсэн огноо': property.updated_at ? property.updated_at.split(' ')[0] : '',
  }));

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Талбай');

  // Set column widths
  const columnWidths = [
    { wch: 8 },   // ID
    { wch: 15 },  // Талбайн дугаар
    { wch: 20 },  // Нэр
    { wch: 30 },  // Тайлбар
    { wch: 12 },  // X координат
    { wch: 12 },  // Y координат
    { wch: 10 },  // Урт
    { wch: 10 },  // Өргөн
    { wch: 15 },  // Талбайн хэмжээ
    { wch: 15 },  // Блокийн нэр
    { wch: 20 },  // Түрээслэгчийн нэр
    { wch: 15 },  // Түрээслэгчийн утас
    { wch: 25 },  // Түрээслэгчийн имэйл
    { wch: 30 },  // Түрээслэгчийн хаяг
    { wch: 15 },  // Талбайн төрөл
    { wch: 10 },  // type_id
    { wch: 15 },  // Барааны төрөл
    { wch: 15 },  // product_type_id
    { wch: 15 },  // Төлөв
    { wch: 12 },  // Үнэлгээний он
    { wch: 15 },  // Үнэ
    { wch: 15 },  // Төлбөр
    { wch: 15 },  // Эхлэх огноо
    { wch: 15 },  // Дуусах огноо
    { wch: 15 },  // Үүсгэсэн огноо
    { wch: 15 },  // Шинэчлэгдсэн огноо
  ];
  worksheet['!cols'] = columnWidths;

  // Generate Excel file and download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

