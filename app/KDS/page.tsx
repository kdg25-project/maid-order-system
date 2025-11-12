import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Clock, ChefHat, CheckCircle2, Car } from "lucide-react";

interface TestData {
    id: number,
    user_id: string,
    menu_id: number,
    state: string,
    created_at: Date,
    updated_at: Date,
};

const testData: TestData[] = [
    {
        id: 1,
        user_id: "b1ef5fb9-9d23-42d7-9aca-bd2dae48b97f",
        menu_id: 1,
        state: "preparing",
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 2,
        user_id: "baaa4e4e-0de0-4fa5-b803-c06574a777a8",
        menu_id: 2,
        state: "preparing",
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 3,
        user_id: "c3d6f4e1-5f4e-4c3b-8b6e-2f4e5d6c7b8a",
        menu_id: 3,
        state: "served",
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 4,
        user_id: "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9g",
        menu_id: 4,
        state: "unknown",
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 5,
        user_id: "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9g0h",
        menu_id: 5,
        state: "pending",
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 6,
        user_id: "f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9g0h1i",
        menu_id: 6,
        state: "preparing",
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 7,
        user_id: "f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9g0h1i",
        menu_id: 6,
        state: "preparing",
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 8,
        user_id: "f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9g0h1i",
        menu_id: 6,
        state: "preparing",
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 9,
        user_id: "f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9g0h1i",
        menu_id: 6,
        state: "preparing",
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 10,
        user_id: "f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9g0h1i",
        menu_id: 6,
        state: "preparing",
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 11,
        user_id: "f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9g0h1i",
        menu_id: 6,
        state: "preparing",
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 12,
        user_id: "f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9g0h1i",
        menu_id: 6,
        state: "preparing",
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 13,
        user_id: "f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9g0h1i",
        menu_id: 6,
        state: "preparing",
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: 14,
        user_id: "f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9g0h1i",
        menu_id: 6,
        state: "preparing",
        created_at: new Date(),
        updated_at: new Date(),
    },
];

const columns = [
    { 
        title: "準備中", 
        state: "preparing", 
        icon: ChefHat,
        badgeVariant: "default" as const,
        color: "bg-yellow-500/10 border-yellow-500/50"
    },
    { 
        title: "提供待機", 
        state: "pending", 
        icon: Clock,
        badgeVariant: "secondary" as const,
        color: "bg-blue-500/10 border-blue-500/50"
    },
    { 
        title: "提供済み", 
        state: "served", 
        icon: CheckCircle2,
        badgeVariant: "outline" as const,
        color: "bg-green-500/10 border-green-500/50"
    },
];

export default function Page() {
    return (
        <div className="min-h-screen bg-gray-200">

            {/* かんばんボード */}
            <main className="container mx-auto p-4">
                <div>
                    <div className="flex w-8xl h-[calc(100vh-126px)]">
                        {columns.map(column => {
                            const Icon = column.icon;
                            const items = testData.filter(item => item.state === column.state);
                            
                            return (
                                <Card key={column.state} className="w-full h-full mx-2 mt-2">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center">
                                            <Icon className="h-5 w-5" />
                                            {column.title}
                                            <Badge variant={column.badgeVariant} className="ml-auto">
                                                {items.length}
                                            </Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    
                                    <CardContent className="flex-1 overflow-hidden p-0">
                                        <ScrollArea className="h-full px-5 pb-2">
                                            <div className="space-y-2">
                                                {items.map(item => (
                                                    <Card 
                                                        key={item.id} 
                                                        className={`${column.color} transition-all hover:shadow-md cursor-pointer`}
                                                    >
                                                        <CardContent className="px-4">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <Badge variant="outline" className="font-mono">
                                                                    #{item.id.toString().padStart(3, '0')}
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {item.created_at.toLocaleTimeString('ja-JP', { 
                                                                        hour: '2-digit', 
                                                                        minute: '2-digit' 
                                                                    })}
                                                                </span>
                                                            </div>
                                                            
                                                            <div>
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-sm text-muted-foreground">メニュー</span>
                                                                    <span className="text-xl font-bold">#{item.menu_id}</span>
                                                                </div>
                                                                
                                                                <div className="pt-2 border-t">
                                                                    <p className="text-xs text-muted-foreground font-mono">
                                                                        {item.user_id.slice(0, 8)}...
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                                
                                                {items.length === 0 && (
                                                    <div className="text-center py-12">
                                                        <Icon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                                                        <p className="text-sm text-muted-foreground">注文なし</p>
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            );
                        })}
                </div>
                    <div className="h-20 w-[800px] mx-auto mt-6">
                        <Card className="w-full h-full relative">
                            <CardContent className="flex">
                                <div className="flex w-60 relative m-auto mr-4 border-r-2 border-gray-400">
                                    <p className="font-bold text-2xl mr-2">ID</p>
                                    <Input className="w-40 border-2 border-gray-400" />
                                </div>
                                <div className="flex-1 flex">
                                    <Button className="flex-none ml-6 w-32 border border-red-500 bg-red-200 hover:bg-red-800/50 text-black font-bold">左へ移動</Button>
                                    <Button className="flex-none ml-6 w-32 absolute right-16 border border-green-500 bg-green-200 hover:bg-green-800/50 text-black font-bold">右へ移動</Button>
                                </div>
                            </CardContent>
                            
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}