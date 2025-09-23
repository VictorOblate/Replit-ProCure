import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  description: string;
}

export function Header({ title, description }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground" data-testid="text-page-description">
            {description}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search items across departments..." 
              className="pl-10 pr-4 py-2 w-80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-global-search"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
          
          <div className="relative">
            <Button variant="ghost" size="sm" data-testid="button-notifications">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                data-testid="badge-notification-count"
              >
                5
              </Badge>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
