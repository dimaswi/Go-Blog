import { useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "es", name: "Española" },
  { code: "pt", name: "Português" },
  { code: "ko", name: "한국인" },
];

export default function LanguageDropdown() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group flex h-9 items-center gap-2 px-3 text-sm font-medium"
        >
          <Globe className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          <span className="text-muted-foreground group-hover:text-foreground">
            {selectedLanguage.name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setSelectedLanguage(language)}
            className="flex items-center justify-between"
          >
            {language.name}
            {selectedLanguage.code === language.code && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
