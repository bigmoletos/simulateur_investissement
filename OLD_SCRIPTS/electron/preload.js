import { contextBridge } from 'electron';

// Exposer des APIs sécurisées au renderer si nécessaire
contextBridge.exposeInMainWorld('electronAPI', {
  // APIs peuvent être ajoutées ici si nécessaire
});

