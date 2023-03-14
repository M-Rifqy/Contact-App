const fs = require('fs');

// Create folder
const dirPath = './data';
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

// Create file inside the folder if the file isn't exist
const dataPath = './data/contacts.json';
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, '[]', 'utf-8');
}

// Get all data from contacts.json
const loadContact = () => {
  const fileBuffer = fs.readFileSync('data/contacts.json', 'utf-8');
  const contacts = JSON.parse(fileBuffer);
  return contacts;
};

// Find contact by phone
const findContact = (phone) => {
  const contacts = loadContact();

  const contact = contacts.find((contact) => contact.phone === phone);
  return contact;
};

// Write / Overide file contacts.json with new data
const saveContacts = (contacts) => {
  fs.writeFileSync('data/contacts.json', JSON.stringify(contacts, null, 4));
};
// Add new contact data
const addContact = (contact) => {
  const contacts = loadContact();
  contacts.push(contact);
  saveContacts(contacts);
};

// Check duplicate
const checkDuplicate = (phone) => {
  const contacts = loadContact();
  return contacts.find((contact) => contact.phone === phone);
};

// Delete Contact
const deleteContact = (phone) => {
  const contacts = loadContact();
  const filteredContacts = contacts.filter(
    (contact) => contact.phone !== phone
  );
  saveContacts(filteredContacts);
};

// Update Contact
const updateContacts = (newContact) => {
  const contacts = loadContact();
  // delete old contacts whose phone numbers are the same as oldPhone
  const filteredContacts = contacts.filter(
    (contact) => contact.phone !== newContact.oldPhone
  );
  delete newContact.oldPhone;
  filteredContacts.push(newContact);
  saveContacts(filteredContacts);
};

module.exports = {
  loadContact,
  findContact,
  addContact,
  checkDuplicate,
  deleteContact,
  updateContacts,
};
