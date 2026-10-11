/** Texty potvrzení odchodu; vlastní překlad, ne chování dialogu. */
import type { UnsavedActionTexts } from "./types";
export const UNSAVED_ACTION_TEXTS_CS: UnsavedActionTexts = {
  close: {
    title: "Zavřít záložku s neuloženými změnami?",
    discard: "Zavřít bez uložení",
    back: "Zpět k dokladu",
    save: "Uložit a zavřít",
  },
  switch: {
    title: "Přepnout s neuloženými změnami?",
    discard: "Přepnout bez uložení",
    back: "Zpět",
    save: "Uložit vše a přepnout",
  },
  logout: {
    title: "Odhlásit se s neuloženými změnami?",
    discard: "Odhlásit bez uložení",
    back: "Zpět",
    save: "Uložit vše a odhlásit",
  },
  navigate: {
    title: "Odejít s neuloženými změnami?",
    discard: "Odejít bez uložení",
    back: "Zpět",
    save: "Uložit a odejít",
  },
};
