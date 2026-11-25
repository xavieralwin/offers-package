import openpyxl

wb = openpyxl.load_workbook(r'C:\Users\Alwin\AppData\Local\Temp\Festive offers - Tablescape, VOCO orchard, Fullerton hotels ...ffer_Update - BRD-1.xlsx', data_only=True)
for sheet in wb.sheetnames:
    ws = wb[sheet]
    m_name = ws.cell(10, 2).value
    o_name = ws.cell(11, 2).value
    if 'voco' in str(m_name).lower():
        print(f"Sheet '{sheet}': Merchant='{m_name}' | Offer='{o_name}'")
