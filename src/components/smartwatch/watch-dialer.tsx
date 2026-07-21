import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Delete,
  Star,
  StarOff,
  UserPlus,
  Mic,
  Volume2,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import {
  loadDialer,
  saveDialer,
  loadSecurity,
  triggerEmergencySOS,
  type WatchContact,
  type CallLogEntry,
  type DialerState,
} from "@/lib/smartwatch";

const KEYS: Array<{ n: string; sub: string }> = [
  { n: "1", sub: "" },
  { n: "2", sub: "ABC" },
  { n: "3", sub: "DEF" },
  { n: "4", sub: "GHI" },
  { n: "5", sub: "JKL" },
  { n: "6", sub: "MNO" },
  { n: "7", sub: "PQRS" },
  { n: "8", sub: "TUV" },
  { n: "9", sub: "WXYZ" },
  { n: "*", sub: "" },
  { n: "0", sub: "+" },
  { n: "#", sub: "" },
];

export const WatchDialer: React.FC = () => {
  const [state, setState] = useState<DialerState>(loadDialer);
  const [dialed, setDialed] = useState("");
  const [inCall, setInCall] = useState<{ name: string; number: string; started: number } | null>(null);
  const [callSec, setCallSec] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");

  React.useEffect(() => {
    if (!inCall) return;
    const id = window.setInterval(() => {
      setCallSec(Math.floor((Date.now() - inCall.started) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [inCall]);

  const update = (patch: Partial<DialerState>) => {
    const next = { ...state, ...patch };
    setState(next);
    saveDialer(next);
  };

  const press = (k: string) => {
    setDialed((d) => (d.length >= 20 ? d : d + k));
    if (navigator.vibrate) navigator.vibrate(15);
  };

  const backspace = () => setDialed((d) => d.slice(0, -1));

  const startCall = (name: string, number: string) => {
    if (!number.trim()) return toast.error("Enter a number first");
    setInCall({ name, number, started: Date.now() });
    setCallSec(0);
    setMuted(false);
    setSpeaker(false);
    toast.success(`Calling ${name}`, { description: number });
    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
  };

  const endCall = () => {
    if (!inCall) return;
    const entry: CallLogEntry = {
      id: `log-${Date.now()}`,
      name: inCall.name,
      number: inCall.number,
      type: "outgoing",
      timestamp: inCall.started,
      duration: Math.floor((Date.now() - inCall.started) / 1000),
    };
    update({ callLog: [entry, ...state.callLog].slice(0, 30) });
    setInCall(null);
    setDialed("");
    toast.message(`Call ended · ${entry.duration}s`);
  };

  const toggleFavorite = (id: string) => {
    update({
      contacts: state.contacts.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c)),
    });
  };

  const addContact = () => {
    if (!newName.trim() || !newNumber.trim()) return toast.error("Name and number required");
    const contact: WatchContact = {
      id: `c-${Date.now()}`,
      name: newName.trim(),
      number: newNumber.trim(),
      favorite: false,
    };
    update({ contacts: [...state.contacts, contact] });
    setNewName("");
    setNewNumber("");
    toast.success("Contact added");
  };

  const removeContact = (id: string) => {
    update({ contacts: state.contacts.filter((c) => c.id !== id) });
    toast.message("Contact removed");
  };

  const sosCall = async () => {
    const sec = loadSecurity();
    toast.warning(`Emergency SOS in ${sec.sosCountdown || 3}s…`, {
      description: "Hold to cancel",
    });
    setTimeout(async () => {
      await triggerEmergencySOS(sec);
      startCall("Emergency", sec.emergencyContacts[0] || state.emergencyNumber);
    }, (sec.sosCountdown || 3) * 1000);
  };

  const favorites = useMemo(() => state.contacts.filter((c) => c.favorite), [state.contacts]);

  const callMins = String(Math.floor(callSec / 60)).padStart(2, "0");
  const callSecs = String(callSec % 60).padStart(2, "0");

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {inCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 to-primary/10 p-4"
          >
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="p-3 rounded-full bg-emerald-500/25"
              >
                <PhoneCall className="h-6 w-6 text-emerald-500" />
              </motion.div>
              <div className="text-lg font-bold text-foreground">{inCall.name}</div>
              <div className="text-xs text-muted-foreground">{inCall.number}</div>
              <div className="text-2xl font-bold tabular-nums text-emerald-500">
                {callMins}:{callSecs}
              </div>
              <div className="grid grid-cols-3 gap-2 w-full mt-2">
                <Button
                  variant={muted ? "default" : "outline"}
                  size="sm"
                  className="flex-col h-14 gap-1"
                  onClick={() => {
                    setMuted((m) => !m);
                    toast.message(muted ? "Mic unmuted" : "Mic muted");
                  }}
                >
                  <Mic className="h-4 w-4" />
                  <span className="text-[10px]">{muted ? "Muted" : "Mute"}</span>
                </Button>
                <Button variant="destructive" size="sm" className="flex-col h-14 gap-1" onClick={endCall}>
                  <PhoneOff className="h-5 w-5" />
                  <span className="text-[10px]">End</span>
                </Button>
                <Button
                  variant={speaker ? "default" : "outline"}
                  size="sm"
                  className="flex-col h-14 gap-1"
                  onClick={() => {
                    setSpeaker((sp) => !sp);
                    toast.message(speaker ? "Speaker off" : "Speaker on");
                  }}
                >
                  <Volume2 className="h-4 w-4" />
                  <span className="text-[10px]">{speaker ? "On" : "Speaker"}</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs defaultValue="keypad">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="keypad">Keypad</TabsTrigger>
          <TabsTrigger value="favorites">Favs</TabsTrigger>
          <TabsTrigger value="contacts">All</TabsTrigger>
          <TabsTrigger value="recents">Recent</TabsTrigger>
        </TabsList>

        <TabsContent value="keypad" className="space-y-3 pt-3">
          <div className="text-center min-h-[2.5rem] text-2xl font-bold tabular-nums text-foreground tracking-wide">
            {dialed || <span className="text-muted-foreground/40 text-base font-normal">Enter number…</span>}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {KEYS.map((k) => (
              <button
                key={k.n}
                onClick={() => press(k.n)}
                className="aspect-square rounded-2xl bg-muted/40 hover:bg-muted/60 active:scale-95 border border-border/30 transition-all flex flex-col items-center justify-center"
              >
                <span className="text-2xl font-bold text-foreground">{k.n}</span>
                {k.sub && <span className="text-[9px] text-muted-foreground tracking-widest">{k.sub}</span>}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 items-center">
            <Button variant="ghost" size="sm" onClick={sosCall} className="text-destructive">
              <ShieldAlert className="h-5 w-5 mr-1" />
              SOS
            </Button>
            <Button
              size="lg"
              className="h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full"
              onClick={() => startCall(dialed || "Unknown", dialed)}
              disabled={!dialed}
            >
              <PhoneCall className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="sm" onClick={backspace} disabled={!dialed}>
              <Delete className="h-5 w-5" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="pt-3">
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {favorites.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">No favorites yet — star a contact.</p>
              ) : (
                favorites.map((c) => (
                  <ContactRow
                    key={c.id}
                    contact={c}
                    onCall={() => startCall(c.name, c.number)}
                    onFavorite={() => toggleFavorite(c.id)}
                    onRemove={() => removeContact(c.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="contacts" className="pt-3 space-y-3">
          <div className="rounded-xl border border-border/30 bg-muted/20 p-2 space-y-2">
            <div className="flex gap-2">
              <Input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-9" />
              <Input placeholder="Number" value={newNumber} onChange={(e) => setNewNumber(e.target.value)} className="h-9" />
            </div>
            <Button size="sm" className="w-full" onClick={addContact}>
              <UserPlus className="h-4 w-4 mr-1" />
              Add contact
            </Button>
          </div>
          <ScrollArea className="h-[240px]">
            <div className="space-y-2">
              {state.contacts.map((c) => (
                <ContactRow
                  key={c.id}
                  contact={c}
                  onCall={() => startCall(c.name, c.number)}
                  onFavorite={() => toggleFavorite(c.id)}
                  onRemove={() => removeContact(c.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="recents" className="pt-3">
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {state.callLog.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-8">No recent calls.</p>
              ) : (
                state.callLog.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/20 p-3"
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        log.type === "missed"
                          ? "bg-destructive/20 text-destructive"
                          : log.type === "incoming"
                          ? "bg-cyan-500/20 text-cyan-500"
                          : "bg-emerald-500/20 text-emerald-500"
                      }`}
                    >
                      {log.type === "missed" ? (
                        <PhoneMissed className="h-4 w-4" />
                      ) : log.type === "incoming" ? (
                        <PhoneIncoming className="h-4 w-4" />
                      ) : (
                        <PhoneOutgoing className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{log.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {log.number} · {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {log.duration}s
                    </Badge>
                    <Button size="icon" variant="ghost" onClick={() => startCall(log.name, log.number)}>
                      <Phone className="h-4 w-4 text-emerald-500" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Dialer preferences */}
      <div className="rounded-xl border border-border/20 bg-card/50 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs">Quick dial from watch face</span>
          <Switch
            checked={state.quickDialEnabled}
            onCheckedChange={(v) => update({ quickDialEnabled: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs">Voice assistant</span>
          <Switch
            checked={state.voiceAssistEnabled}
            onCheckedChange={(v) => update({ voiceAssistEnabled: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs">Show caller photo</span>
          <Switch
            checked={state.showCallerPhoto}
            onCheckedChange={(v) => update({ showCallerPhoto: v })}
          />
        </div>
      </div>
    </div>
  );
};

const ContactRow: React.FC<{
  contact: WatchContact;
  onCall: () => void;
  onFavorite: () => void;
  onRemove: () => void;
}> = ({ contact, onCall, onFavorite, onRemove }) => (
  <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/20 p-2.5">
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-lg">
      {contact.emoji || contact.name.charAt(0)}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-semibold text-foreground truncate">{contact.name}</div>
      <div className="text-[10px] text-muted-foreground truncate">{contact.number}</div>
    </div>
    <Button size="icon" variant="ghost" onClick={onFavorite}>
      {contact.favorite ? (
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      ) : (
        <StarOff className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
    <Button size="icon" variant="ghost" onClick={onCall}>
      <Phone className="h-4 w-4 text-emerald-500" />
    </Button>
    <Button size="icon" variant="ghost" onClick={onRemove}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  </div>
);

export default WatchDialer;
