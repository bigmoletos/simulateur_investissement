// Commandes Rust exposées au frontend
// Pour l'instant, vide - sera rempli si nécessaire pour des calculs critiques

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct CalculationResult {
    pub result: f64,
}

// Exemple de commande (à implémenter si nécessaire)
// #[tauri::command]
// pub fn calculate_critical(value: f64) -> CalculationResult {
//     CalculationResult { result: value * 2.0 }
// }

