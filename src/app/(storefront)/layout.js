import ConditionalHeader from '../../components/layout/ConditionalHeader';
import StoreHeader from '../../components/layout/StoreHeader';

export default function StorefrontLayout({ children }) {
    return <ConditionalHeader storeHeader={<StoreHeader />}>{children}</ConditionalHeader>;
}
