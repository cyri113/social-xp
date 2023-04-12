import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import DocumentDuplicateIcon from "../components/DocumentDuplicateIcon.tsx";
import CheckmarkIcon from "../components/CheckmarkIcon.tsx";

interface CopyCodeProps {
  text: string;
}

export default function CopyCode(props: CopyCodeProps) {

    const [isCopied, setIsCopied] = useState(false)

    function copy() {
        navigator.clipboard.writeText(props.text)
        console.log('copied', props.text)
        setIsCopied(true)
    }

  return (
        <div class={'bg-gray-100 rounded-lg px-4 py-1 flex gap-4 justify-between items-center'}>
            <code>{props.text}</code>
            <div class={'flex gap-1 items-center'}>
            <Button onClick={copy}><DocumentDuplicateIcon /></Button>
            { isCopied && <CheckmarkIcon />}
            </div>
        </div>
  );
}
