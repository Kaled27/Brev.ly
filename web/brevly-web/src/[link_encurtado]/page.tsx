import { useParams } from "react-router-dom";
import { Card } from "../components/ui/card";

export function Page() {
    const { linkEncurtado } = useParams();
  return (
    <div className="fixed flex items-center justify-center bg-gray-200 min-h-screen min-w-full">
      <Card.Root className="lg:min-w-[580px] lg:min-h-[296px] lg:flex-1 flex items-center justify-center">
        <Card.Content className="flex flex-col items-center justify-center gap-3 p-8 w-full text-center">
          <img src="/Logo_V.svg" alt="Brevly logo" width={50} height={50} className="mx-auto" />
     
          <p className="text-xl font-bold text-gray-600 w-full text-center">
            Redirecionando...
          </p>
          <span className="text-md text-gray-600 w-full text-center font-semibold">
            O link será aberto automaticamente em alguns instantes.<br />
            Não foi redirecionado?{" "}
            <a
              href={`${window.location.origin}/${linkEncurtado}`}
              className="text-blue-base text-md font-semibold underline"
            >
              Acesse aqui
            </a>
       
          </span>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
