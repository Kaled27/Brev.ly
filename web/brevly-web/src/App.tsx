import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { ButtonDefault } from "./components/ui/button/ButtonDefault";
import { Card } from "./components/ui/card";
import { InputDefault } from "./components/ui/input/InputDefault";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start gap-4 bg-gray-200 px-3 pt-8 lg:px-8 lg:pt-10">
      <div className="flex w-full max-w-[1120px] flex-col gap-4">
        <img
          src="/Logo_H.svg"
          width={100}
          height={100}
          alt="Brevly logo"
          className="mx-auto pb-2 lg:mx-0 lg:pb-4"
        />

        <div className="flex w-full flex-col items-center gap-4 lg:flex-row lg:items-start">
          <Card.Root className="shrink-0">
          <Card.Header>
            <h2 className="text-lg font-bold">Novo link</h2>
          </Card.Header>
          <Card.Content>
            <InputDefault
              variant="primary-default"
              label="link original"
              placeholder="www.exemplo.com.br"
            />
            <InputDefault
              variant="primary-default"
              label="link encurtado"
              placeholder="brev.ly/"
            />
          </Card.Content>
          <Card.Footer>
            <ButtonDefault variant="primary-default" disabled>
              Salvar link
            </ButtonDefault>
          </Card.Footer>
          </Card.Root>

          <Card.Root className="lg:max-w-none lg:flex-1">
          <Card.Header className="flex flex-row items-center justify-between">
            <h2 className="text-lg text-gray-600 font-bold">Meus links</h2>
            <ButtonDefault variant="icon-default" className="gap-2" disabled>
              <DownloadSimpleIcon size={16} />
              Baixar CSV
            </ButtonDefault>
          </Card.Header>
          <div className="my-4 h-px w-full bg-gray-200" />
          <Card.Content>
            <div className="py-6 flex flex-col items-center justify-center gap-2">
              <img src="/Link.svg" alt="Link icon" className="mx-auto" />
              <p className="text-center text-gray-500 text-xs">
                AINDA NÃO EXISTEM LINKS CADASTRADOS
              </p>
            </div>
          </Card.Content>
          </Card.Root>
        </div>
      </div>
    </div>
  );
}
