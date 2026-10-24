/** Kontrola peněz z hotových výsledků APP; DS nepřepočítává zůstatky. */
import {forwardRef,type ComponentPropsWithoutRef} from 'react';
import {DataGrid} from '../grid/DataGrid';
import type {DataGridColumn} from '../grid/data-grid-types';
import {useDsTexts} from '../../../ds-texts';
import {cn} from '../../../lib/utils';
import type {CashCheckRow} from './tax-record-types';
export interface CashCheckPanelProps extends ComponentPropsWithoutRef<'div'> {rows:CashCheckRow[];onAccountOpen?:(id:string)=>void;storageKey?:string}
export const CashCheckPanel=forwardRef<HTMLDivElement,CashCheckPanelProps>(function CashCheckPanel({rows,onAccountOpen,storageKey='cash-check',className,...props},ref){
 const t=useDsTexts().taxRecords;
 const columns:DataGridColumn<CashCheckRow>[]=[{id:'label',label:t.cashAccount,value:r=>r.label},{id:'currency',label:t.currency,value:r=>r.currency},
 ...(['opening','movements','closing','difference'] as const).map(id=>({id,label:t[id],value:(r:CashCheckRow)=>r[id],numeric:true,decimals:2,total:'none' as const,...(id==='difference'?{className:'text-destructive-strong'}:{})}))];
 return <div ref={ref} {...props} className={cn('min-w-0',className)}><DataGrid title={t.cashCheck} rows={rows} columns={columns} rowKey={r=>r.id} storageKey={storageKey} onRowOpen={r=>onAccountOpen?.(r.id)} rowClassName={r=>r.difference!==0?'bg-destructive-soft':undefined} /></div>;
});
