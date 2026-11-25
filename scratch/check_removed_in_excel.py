import openpyxl

wb = openpyxl.load_workbook('merchant-id-register.xlsx', data_only=True)
for sheet in wb.sheetnames:
    ws = wb[sheet]
    for r in range(2, ws.max_row + 1):
        num = ws.cell(r, 3).value
        if num in [11, 477, 514, 515, 516, 517]:
            print(f"Sheet '{sheet}' Row {r}: Offer {num} - {ws.cell(r, 5).value} | Status/Notes: {ws.cell(r, 17).value}")
