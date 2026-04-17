import { Card } from "../components/ui/card";

export function Page() {
  return (
    <div className="fixed flex min-h-screen min-w-full items-center justify-center bg-gray-200 px-3">
      <Card.Root className="flex flex-1 items-center justify-center lg:min-h-[296px] lg:min-w-[580px]">
        <Card.Content className="flex w-full flex-col items-center justify-center gap-3 p-8 text-center">
          <img
            src="/404.svg"
            alt="404 — link não encontrado"
            width={320}
            height={120}
            className="mx-auto h-auto w-full max-w-[280px] sm:max-w-[320px]"
          />

          <h1 className="text-2xl font-bold text-gray-900">
            Link não encontrado
          </h1>

          <p className="max-w-md text-base leading-relaxed text-gray-600">
            O link que você está tentando acessar não existe, foi removido ou é
            uma URL inválida. Saiba mais em{" "}
            <a
              href="https://brev.ly"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-base underline hover:text-blue-dark"
            >
              brev.ly
            </a>
            .
          </p>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
