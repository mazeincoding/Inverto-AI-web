import { Announcement } from "@/types/announcement";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";

interface AnnouncementsDialogProps {
  show_dialog: boolean;
  set_show_dialog: (show: boolean) => void;
  unseen_announcements: Announcement[];
  handle_close_dialog: () => void;
}

export function AnnouncementsDialog({
  show_dialog,
  set_show_dialog,
  unseen_announcements,
  handle_close_dialog,
}: AnnouncementsDialogProps) {
  return (
    <Dialog open={show_dialog} onOpenChange={set_show_dialog}>
      <DialogContent className="sm:max-w-[425px] p-0">
        <Card className="max-h-[80vh] flex flex-col gap-4">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">
              New Announcements!
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6">
                {unseen_announcements.map((announcement) => (
                  <Card key={announcement.id} className="bg-card shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-card-foreground mb-2">
                        {announcement.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {announcement.changes &&
                        announcement.changes.length > 0 && (
                          <ul className="space-y-2">
                            {announcement.changes.map((change, changeIndex) => (
                              <li
                                key={changeIndex}
                                className="flex items-start gap-2"
                              >
                                <span className="text-primary leading-none">
                                  •
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {change}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                          Version: {announcement.version}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <Button onClick={handle_close_dialog} className="w-full">
              Got it!
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
