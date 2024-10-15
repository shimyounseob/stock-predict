import { FC, useEffect, useState } from 'react';

interface Props {
  code: string;
  editable?: boolean;
  onChange?: (value: string) => void;
}

export const MarkdownBlock: FC<Props> = ({
  code,
  editable = false,
  onChange = () => {},
}) => {
  const [ReactMarkdown, setReactMarkdown] = useState<any>(null); // ReactMarkdown을 동적으로 로드
  const [copyText, setCopyText] = useState<string>('Copy');

  useEffect(() => {
    // 동적으로 ReactMarkdown을 import
    import('react-markdown').then((mod) => {
      setReactMarkdown(() => mod.default);
    });
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCopyText('Copy');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [copyText]);

  if (!ReactMarkdown) {
    return null; // 로딩 중에는 아무것도 표시하지 않음
  }

  return (
    <div className="relative">
      <button
        className="absolute right-0 top-0 z-10 rounded bg-[#1A1B26] p-1 text-xs text-white hover:bg-[#2D2E3A] active:bg-[#2D2E3A]"
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopyText('Copied!');
        }}
      >
        {copyText}
      </button>

      <div className="p-4 h-500px bg-[#1A1B26] text-white overflow-scroll rounded-md">
        <ReactMarkdown className="font-normal">{code}</ReactMarkdown>
      </div>
    </div>
  );
};
