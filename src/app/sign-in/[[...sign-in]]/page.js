import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    return (
        <main className='flex min-h-screen items-center justify-center p-4'>
            <div className='-translate-y-6'>
                <SignIn />
            </div>
        </main>
    );
}
