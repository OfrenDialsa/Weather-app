import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
 
export function ThemeSwitch() {
  return (
    <div className="flex flex-col-reverse items-end">
      <Switch id="dark-mode" />
      <Label htmlFor="dark-mode">Dark Mode</Label>
    </div>
  )
}