import {createFileRoute} from '@tanstack/react-router';
import {ShowcaseLayout} from '@/components/showcase/ShowcaseLayout';
import {AccountingFormsNav} from '@/components/showcase/AccountingFormsNav';
import {TaxRecordsShowcase} from '@/components/showcase/TaxRecordsShowcase';
export const Route=createFileRoute('/components/tax-records')({
 head:()=>({meta:[{title:'Daňová evidence – Slivka Design System'},{name:'description',content:'Doklady s položkami, kniha příjmů a výdajů a kontrola peněz.'},{property:'og:title',content:'Daňová evidence – Slivka Design System'},{property:'og:description',content:'Ukázky daňové evidence, položek a přehledů.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=> <ShowcaseLayout breadcrumbs={[{label:'Komponenty',to:'/'},{label:'Daňová evidence'}]}><AccountingFormsNav/><TaxRecordsShowcase/></ShowcaseLayout>
});
