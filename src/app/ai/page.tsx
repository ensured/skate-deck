import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// import AIChat from "@/components/AIChat";

export default async function AIPage() {
  return (
    <div className="min-h-[calc(100vh-69px)] p-4 md:p-8 ">
      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="text-to-speach">Text to Speach</TabsTrigger>
        </TabsList>
        <TabsContent value="chat">{/* <AIChat /> */}</TabsContent>
        <TabsContent value="text-to-speach">{/* <TTS /> */}</TabsContent>
      </Tabs>
    </div>
  );
}
