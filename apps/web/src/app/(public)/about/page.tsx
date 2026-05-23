export default function About() {
  return (
    <main className="flex flex-col items-center justify-between p-12">
      <section className="flex">
        <article className="w-full flex items-center justify-start">
          <h1 className="text-3xl font-bold text-left">Sobre mim</h1>
        </article>
        <div>
          <Image src="/images/profile.jpg" alt="Foto de perfil" width={200} height={200} className="rounded-full" />
        </div>
      </section>
    </main>
  );
}
