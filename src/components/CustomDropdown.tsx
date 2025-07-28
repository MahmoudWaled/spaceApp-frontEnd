import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DropdownItem {
  label: string;
  onClick: () => void;
  className?: string;
}

interface CustomDropdownProps {
  items: DropdownItem[];
  triggerClassName?: string;
  contentClassName?: string;
  children?: React.ReactNode;
}

export function CustomDropdown({
  items,
  triggerClassName = "h-8 w-8",
  contentClassName,
  children,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative flex-shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className={cn("flex-shrink-0", triggerClassName)}
        style={{
          minWidth: triggerClassName.includes("h-8") ? "32px" : "24px",
          minHeight: triggerClassName.includes("h-8") ? "32px" : "24px",
          position: "relative",
          zIndex: 1,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {children || (
          <MoreHorizontal
            className={triggerClassName.includes("h-8") ? "h-4 w-4" : "h-3 w-3"}
          />
        )}
      </Button>

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full mt-1 z-50 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
            contentClassName
          )}
          style={{
            position: "absolute",
            zIndex: 9999,
            transform: "none",
          }}
        >
          {items.map((item, index) => (
            <button
              key={index}
              className={cn(
                "relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                item.className
              )}
              onClick={() => handleItemClick(item)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
