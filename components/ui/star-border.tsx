import { cn } from "@/lib/utils"
import { ElementType, ComponentPropsWithoutRef } from "react"

interface StarBorderProps<T extends ElementType> {
  as?: T
  color?: string
  speed?: string
  className?: string
  children: React.ReactNode
}

export function StarBorder<T extends ElementType = "button">({
  as,
  className,
  color,
  speed = "6s",
  children,
  ...props
}: StarBorderProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof StarBorderProps<T>>) {
  const Component = as || "button"
  const defaultColor = color || "hsl(var(--foreground))"

  return (
    <Component 
      className={cn(
        "relative inline-block py-[1px] overflow-hidden rounded-lg group",
        className
      )} 
      {...props}
    >
      <div
        className={cn(
          "absolute w-[300%] h-[50%] bottom-[-11px] right-[-250%] rounded-full group-hover:animate-star-movement-bottom z-0",
          "opacity-0 group-hover:opacity-20 dark:group-hover:opacity-70 transition-opacity duration-300" 
        )}
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className={cn(
          "absolute w-[300%] h-[50%] top-[-10px] left-[-250%] rounded-full group-hover:animate-star-movement-top z-0",
          "opacity-0 group-hover:opacity-20 dark:group-hover:opacity-70 transition-opacity duration-300"
        )}
        style={{
          background: `radial-gradient(circle, ${defaultColor}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div className={cn(
        "relative z-1 border text-white text-center text-base py-2.5 px-6 rounded-lg",
        "bg-gradient-to-b from-blue-600 to-blue-700 border-blue-500/40",
        "dark:from-blue-600 dark:to-blue-700 dark:border-blue-500/40"
      )}>
        {children}
      </div>
    </Component>
  )
}