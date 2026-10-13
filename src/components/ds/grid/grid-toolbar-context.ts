/**
 * Úroveň kaskády lišty gridu.
 * Vlastní: sdílený kontext 0–3 mezi lištou a jejími částmi.
 * Nesmí: obsahovat chování ani měření.
 */
import * as React from "react";

/** Úroveň zhuštění lišty: 0 vše, 3 nejužší. */
export const GridToolbarOverflowContext = React.createContext<0 | 1 | 2 | 3>(0);
