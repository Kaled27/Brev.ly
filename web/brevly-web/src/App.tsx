import { Copy } from "@phosphor-icons/react";
import { ButtonDefault } from "./components/ui/button/ButtonDefault";

export default function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <ButtonDefault variant="primary-default">Label</ButtonDefault>
      <ButtonDefault variant="primary-hover">Label</ButtonDefault>
      <ButtonDefault variant="primary-disabled">Label</ButtonDefault>

      <ButtonDefault variant="secondary-default">
        <div className="flex items-center gap-2">
          <Copy className="text-gray-600"/>
          Label
        </div>
      </ButtonDefault>
      <ButtonDefault variant="secondary-hover">
        <div className="flex items-center gap-2">
          <Copy className="text-gray-600"/>
          Label
        </div>
      </ButtonDefault>
      <div>
        <ButtonDefault variant="secondary-disabled">
          <div className="flex items-center gap-2">
            <Copy className="text-gray-600/50"/>
            Label
          </div>
        </ButtonDefault>
      </div>
    </div>
  );
}
