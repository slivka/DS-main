/** Texty ukázky formulářů; vlastní jen náhledový obsah, nesmí se dostat do veřejného DsTexts. */
import { DS_TEXTS_SK, useDsTexts } from "../../ds-texts";

/** Texty jedné jazykové verze ukázky. */
export interface FormDesignShowcaseTexts {
  /** Nadpis ukázky. */
  title: string;
  /** Nadpis přijatého dokladu. */
  receivedDocument: string;
  /** Popisek konstantního symbolu. */
  constantSymbol: string;
  /** Vzor zápisu čísla účtu. */
  accountNumberPattern: string;
}

const CS: FormDesignShowcaseTexts = {
  title: "Design formulářů – 2.90.0",
  receivedDocument: "Přijatý doklad",
  constantSymbol: "Konstantní symbol",
  accountNumberPattern: "předčíslí-číslo",
};

const SK: FormDesignShowcaseTexts = {
  title: "Dizajn formulárov – 2.90.0",
  receivedDocument: "Prijatý doklad",
  constantSymbol: "Konštantný symbol",
  accountNumberPattern: "predčíslie-číslo",
};

/** Texty ukázky podle jazyka knihovny. */
export function useFormDesignShowcaseTexts(): FormDesignShowcaseTexts {
  return useDsTexts().documentForm.supplierNumber === DS_TEXTS_SK.documentForm.supplierNumber
    ? SK
    : CS;
}
