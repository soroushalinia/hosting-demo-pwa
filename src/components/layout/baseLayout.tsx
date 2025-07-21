import Footer from '@/components/navigation/footer';
import Navbar from '@/components/navigation/navbar';

export default function BaseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar></Navbar>
      <div className="flex min-h-[calc(100vh-120px)] w-full flex-row items-start justify-center">
        <div className="h-full w-full max-w-7xl p-6">{children}</div>
      </div>
      <Footer></Footer>
    </>
  );
}
