// Google Apps Script para CRM WhatsApp
//部署 como Web App

const SHEET_NAME = "Contatos";

function doGet() {
  return HtmlService.createHtmlOutput("CRM WhatsApp API - Funcionando!");
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  
  const sheet = getOrCreateSheet();
  
  if (action === "sync") {
    return syncContacts(data.contacts, sheet);
  } else if (action === "get") {
    return getAllContacts(sheet);
  }
  
  return { success: false, message: "Ação inválida" };
}

function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(["ID", "Nome", "Telefone", "Email", "Empresa", "Status", "Notas", "Data Criação", "Última Atualização"]);
  }
  
  return sheet;
}

function syncContacts(contacts, sheet) {
  try {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const existingData = sheet.getDataRange().getValues();
    const existingIds = existingData.slice(1).map(row => row[0]);
    
    const now = new Date().toLocaleString("pt-BR");
    
    contacts.forEach(contact => {
      const existingIndex = existingIds.indexOf(contact.id);
      
      const rowData = [
        contact.id,
        contact.name || "",
        contact.phone || "",
        contact.email || "",
        contact.company || "",
        contact.status || "new",
        contact.notes || "",
        contact.createdAt ? new Date(contact.createdAt).toLocaleString("pt-BR") : now,
        now
      ];
      
      if (existingIndex >= 0) {
        sheet.getRange(existingIndex + 2, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }
    });
    
    return { success: true, message: "Sincronizado com sucesso!" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

function getAllContacts(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const contacts = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const contact = {};
    headers.forEach((header, index) => {
      contact[header.toLowerCase().replace(/ /g, "")] = row[index];
    });
    contacts.push(contact);
  }
  
  return { success: true, contacts: contacts };
}
