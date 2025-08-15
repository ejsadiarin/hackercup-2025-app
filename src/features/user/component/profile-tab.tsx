import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfileTab() {
  return (
    <>
      <div>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-bold">Max Benedict Chavez</h1>
            <h2>Pasay</h2>
          </div>
        </div>
      </div>
    </>
  );
}
