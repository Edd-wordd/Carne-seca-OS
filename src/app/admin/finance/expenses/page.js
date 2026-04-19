import { ExpensesClient } from './_components/ExpensesClient';
import { getExpenses } from '@/lib/supabase/queries/expenses/getExpenses';
import { normalizeExpenseFromDb } from '@/lib/utils/normalizeExpenseFromDb';

function normalizeExpenses(data) {
    if (!Array.isArray(data)) return [];
    return data.map(normalizeExpenseFromDb).filter(Boolean);
}

export default async function ExpensesPage() {
    const result = await getExpenses();
    const raw = result?.success ? (result.data ?? []) : [];
    const initialExpenses = normalizeExpenses(raw);

    return <ExpensesClient initialExpenses={initialExpenses} />;
}
