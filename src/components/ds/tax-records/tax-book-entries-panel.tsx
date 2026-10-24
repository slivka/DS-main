/** Zápisy v knize v Propojených; APP dodává vazby a navigaci. */
import {forwardRef,type ComponentPropsWithoutRef} from 'react';
import {LinkedRecordsPanel} from '../data-display/linked-records-panel';
import {useDsTexts} from '../../../ds-texts';
import type {TaxBookEntry} from './tax-record-types';
export interface TaxBookEntriesPanelProps extends ComponentPropsWithoutRef<'div'> {entries:TaxBookEntry[];currency:string;onEntryOpen:(entry:TaxBookEntry)=>void}
export const TaxBookEntriesPanel=forwardRef<HTMLDivElement,TaxBookEntriesPanelProps>(function TaxBookEntriesPanel({entries,currency,onEntryOpen,...props},ref){
 const t=useDsTexts().taxRecords;
 return <LinkedRecordsPanel ref={ref} {...props} mode="list" onModeChange={()=>{}} collapsedGroups={[]} onCollapsedGroupsChange={()=>{}} groups={[{id:'tax-book',label:t.entries,items:entries.map(e=>({id:e.id,typeLabel:e.item,number:e.paymentDocument,at:e.date,amount:e.amount,currency}))}]} onOpen={item=>{const entry=entries.find(e=>e.id===item.id);if(entry)onEntryOpen(entry);}}/>;
});
