import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Phone,
  ShieldCheck,
  Lock,
  Fingerprint,
  Siren,
  HeartPulse,
  Activity as ActivityIcon,
  Droplets,
  Wind,
  Thermometer,
  Waves,
  Volume2,
  Sun,
  Music,
  Camera,
  Flashlight,
  CreditCard,
  Layers,
  Plus,
  Trash2,
  BellRing,
  AlarmClock,
  MapPin,
  KeyRound,
  ScanFace,
  ShieldAlert,
} from "lucide-react";
import { WatchDialer } from "./watch-dialer";
import {
  loadSecurity,
  saveSecurity,
  hashPasscode,
  loadAlarms,
  saveAlarms,
  loadComplications,
  saveComplications,
  loadAdvanced,
  saveAdvanced,
  COMPLICATION_LIBRARY,
  type SecurityConfig,
  type WatchAlarm,
  type Complications,
  type ComplicationSlot,
  type ComplicationType,
  type AdvancedSettings,
} from "@/lib/smartwatch";

const Section: React.FC<{ icon: React.ReactNode; title: string; badge?: string; children: React.ReactNode }> = ({
  icon,
  title,
  badge,
  children,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-border/20 bg-card/60 backdrop-blur-xl shadow-lg overflow-hidden"
  >
    <div className="px-4 py-3 border-b border-border/20 flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{icon}</div>
      <h2 className="text-sm font-bold text-foreground flex-1">{title}</h2>
      {badge && (
        <Badge variant="outline" className="text-[10px]">
          {badge}
        </Badge>
      )}
    </div>
    <div className="p-4 space-y-3">{children}</div>
  </motion.div>
);

const Row: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="min-w-0">
      <div className="text-xs text-foreground">{label}</div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
    {children}
  </div>
);

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export const SmartwatchSettingsExtras: React.FC = () => {
  const [security, setSecurity] = useState<SecurityConfig>(loadSecurity);
  const [alarms, setAlarms] = useState<WatchAlarm[]>(loadAlarms);
  const [complications, setComplications] = useState<Complications>(loadComplications);
  const [advanced, setAdvanced] = useState<AdvancedSettings>(loadAdvanced);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newAlarmLabel, setNewAlarmLabel] = useState("");
  const [newAlarmTime, setNewAlarmTime] = useState("07:00");

  useEffect(() => saveSecurity(security), [security]);
  useEffect(() => saveAlarms(alarms), [alarms]);
  useEffect(() => saveComplications(complications), [complications]);
  useEffect(() => saveAdvanced(advanced), [advanced]);

  const updSec = <K extends keyof SecurityConfig>(k: K, v: SecurityConfig[K]) =>
    setSecurity((s) => ({ ...s, [k]: v }));
  const updAdv = <K extends keyof AdvancedSettings>(k: K, v: AdvancedSettings[K]) =>
    setAdvanced((a) => ({ ...a, [k]: v }));

  const setPasscode = () => {
    if (!/^\d{4,8}$/.test(passcodeInput)) return toast.error("PIN must be 4-8 digits");
    updSec("passcode", hashPasscode(passcodeInput));
    updSec("passcodeEnabled", true);
    setPasscodeInput("");
    toast.success("Passcode set");
  };

  const addContact = () => {
    if (!newContact.trim()) return;
    updSec("emergencyContacts", [...security.emergencyContacts, newContact.trim()]);
    setNewContact("");
    toast.success("Emergency contact added");
  };

  const removeContact = (i: number) => {
    updSec(
      "emergencyContacts",
      security.emergencyContacts.filter((_, idx) => idx !== i),
    );
  };

  const addAlarm = () => {
    const a: WatchAlarm = {
      id: `al-${Date.now()}`,
      label: newAlarmLabel || "Alarm",
      time: newAlarmTime,
      days: [1, 2, 3, 4, 5],
      enabled: true,
      vibrate: true,
      sound: "chime",
      smartWake: false,
    };
    setAlarms([a, ...alarms]);
    setNewAlarmLabel("");
    toast.success("Alarm added");
  };

  const toggleDay = (id: string, d: number) => {
    setAlarms((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, days: a.days.includes(d) ? a.days.filter((x) => x !== d) : [...a.days, d].sort() } : a,
      ),
    );
  };

  const setSlot = (slot: ComplicationSlot, type: ComplicationType) =>
    setComplications((c) => ({ ...c, [slot]: type }));

  return (
    <>
      {/* Dialer */}
      <Section icon={<Phone className="h-4 w-4" />} title="Smartwatch Dialer" badge="NEW">
        <WatchDialer />
      </Section>

      {/* Security */}
      <Section icon={<ShieldCheck className="h-4 w-4" />} title="Security & App Lock" badge="Encrypted">
        <Row label="Passcode lock" hint="Requires PIN to unlock watch">
          <Switch checked={security.passcodeEnabled} onCheckedChange={(v) => updSec("passcodeEnabled", v)} />
        </Row>
        {security.passcodeEnabled && (
          <div className="flex items-center gap-2">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={8}
              placeholder="Set 4-8 digit PIN"
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value.replace(/\D/g, ""))}
              className="h-9"
            />
            <Button size="sm" onClick={setPasscode}>
              <KeyRound className="h-4 w-4 mr-1" />
              Set
            </Button>
          </div>
        )}
        <Row label="Biometric unlock" hint="Face/Fingerprint on paired phone">
          <Switch checked={security.biometricUnlock} onCheckedChange={(v) => updSec("biometricUnlock", v)} />
        </Row>
        <Row label="Wrist detection" hint="Auto-lock when watch is removed">
          <Switch checked={security.wristDetection} onCheckedChange={(v) => updSec("wristDetection", v)} />
        </Row>
        <Row label="Lock on removal">
          <Switch checked={security.lockOnRemoval} onCheckedChange={(v) => updSec("lockOnRemoval", v)} />
        </Row>
        <Row label="End-to-end encryption" hint="AES-256 for health data sync">
          <Switch checked={security.encryptionEnabled} onCheckedChange={(v) => updSec("encryptionEnabled", v)} />
        </Row>
        <Row label="App lock" hint="Require biometric for sensitive apps">
          <Switch checked={security.appLock} onCheckedChange={(v) => updSec("appLock", v)} />
        </Row>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs">Auto-lock after</span>
            <span className="text-xs font-semibold tabular-nums">{security.autoLockMinutes} min</span>
          </div>
          <Slider
            value={[security.autoLockMinutes]}
            min={1}
            max={60}
            step={1}
            onValueChange={([v]) => updSec("autoLockMinutes", v)}
          />
        </div>
        <Row label="Hide previews when locked">
          <Switch
            checked={security.hidePreviewsWhenLocked}
            onCheckedChange={(v) => updSec("hidePreviewsWhenLocked", v)}
          />
        </Row>
      </Section>

      {/* Emergency SOS */}
      <Section icon={<Siren className="h-4 w-4 text-destructive" />} title="Emergency SOS & Safety">
        <Row label="Fall detection" hint="Detects hard falls automatically">
          <Switch checked={security.fallDetection} onCheckedChange={(v) => updSec("fallDetection", v)} />
        </Row>
        <Row label="Crash detection">
          <Switch checked={security.crashDetection} onCheckedChange={(v) => updSec("crashDetection", v)} />
        </Row>
        <Row label="Share location on SOS">
          <Switch checked={security.shareLocationOnSOS} onCheckedChange={(v) => updSec("shareLocationOnSOS", v)} />
        </Row>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs">SOS countdown</span>
            <span className="text-xs font-semibold tabular-nums">{security.sosCountdown}s</span>
          </div>
          <Slider
            value={[security.sosCountdown]}
            min={0}
            max={15}
            step={1}
            onValueChange={([v]) => updSec("sosCountdown", v)}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Emergency contacts</Label>
          <div className="flex gap-2">
            <Input
              placeholder="+91 98765 43210"
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
              className="h-9"
            />
            <Button size="sm" onClick={addContact}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {security.emergencyContacts.map((n, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 px-3 py-2"
            >
              <span className="text-xs">{n}</span>
              <Button size="icon" variant="ghost" onClick={() => removeContact(i)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </Section>

      {/* Medical ID */}
      <Section icon={<HeartPulse className="h-4 w-4 text-rose-400" />} title="Medical ID">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Blood type</Label>
            <Input
              placeholder="O+"
              value={security.medicalId.bloodType}
              onChange={(e) => updSec("medicalId", { ...security.medicalId, bloodType: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="flex items-end">
            <Row label="Organ donor">
              <Switch
                checked={security.medicalId.organDonor}
                onCheckedChange={(v) => updSec("medicalId", { ...security.medicalId, organDonor: v })}
              />
            </Row>
          </div>
        </div>
        <div>
          <Label className="text-xs">Allergies</Label>
          <Textarea
            rows={2}
            value={security.medicalId.allergies}
            onChange={(e) => updSec("medicalId", { ...security.medicalId, allergies: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">Medical conditions</Label>
          <Textarea
            rows={2}
            value={security.medicalId.conditions}
            onChange={(e) => updSec("medicalId", { ...security.medicalId, conditions: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-xs">Medications</Label>
          <Textarea
            rows={2}
            value={security.medicalId.medications}
            onChange={(e) => updSec("medicalId", { ...security.medicalId, medications: e.target.value })}
          />
        </div>
        <p className="text-[10px] text-muted-foreground">Shown on lock screen for first responders.</p>
      </Section>

      {/* Advanced Health */}
      <Section icon={<HeartPulse className="h-4 w-4" />} title="Advanced Health Sensors">
        <Row label="ECG monitoring" hint="On-demand electrocardiogram">
          <Switch checked={advanced.ecgEnabled} onCheckedChange={(v) => updAdv("ecgEnabled", v)} />
        </Row>
        <Row label="Blood pressure">
          <Switch checked={advanced.bloodPressureEnabled} onCheckedChange={(v) => updAdv("bloodPressureEnabled", v)} />
        </Row>
        <Row label="Skin temperature">
          <Switch
            checked={advanced.skinTemperatureEnabled}
            onCheckedChange={(v) => updAdv("skinTemperatureEnabled", v)}
          />
        </Row>
        <Row label="Menstrual cycle tracking">
          <Switch checked={advanced.menstrualTracking} onCheckedChange={(v) => updAdv("menstrualTracking", v)} />
        </Row>
        <Row label="Breathing reminders">
          <Switch checked={advanced.breathingReminders} onCheckedChange={(v) => updAdv("breathingReminders", v)} />
        </Row>
        <Row label="Bedtime mode">
          <Switch checked={advanced.bedtimeMode} onCheckedChange={(v) => updAdv("bedtimeMode", v)} />
        </Row>
        <Row label="Handwash detection">
          <Switch checked={advanced.handwashDetection} onCheckedChange={(v) => updAdv("handwashDetection", v)} />
        </Row>
      </Section>

      {/* Hydration & Environment */}
      <Section icon={<Droplets className="h-4 w-4 text-cyan-400" />} title="Hydration & Environment">
        <Row label="Hydration tracking">
          <Switch checked={advanced.hydrationTracking} onCheckedChange={(v) => updAdv("hydrationTracking", v)} />
        </Row>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5" /> Daily goal
            </span>
            <span className="text-xs font-semibold tabular-nums">{advanced.hydrationGoalMl} ml</span>
          </div>
          <Slider
            value={[advanced.hydrationGoalMl]}
            min={500}
            max={5000}
            step={100}
            onValueChange={([v]) => updAdv("hydrationGoalMl", v)}
          />
        </div>
        <Row label="Noise alerts" hint="Warn on loud environments">
          <Switch checked={advanced.noiseAlerts} onCheckedChange={(v) => updAdv("noiseAlerts", v)} />
        </Row>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5" /> Noise threshold
            </span>
            <span className="text-xs font-semibold tabular-nums">{advanced.noiseThresholdDb} dB</span>
          </div>
          <Slider
            value={[advanced.noiseThresholdDb]}
            min={60}
            max={110}
            step={1}
            onValueChange={([v]) => updAdv("noiseThresholdDb", v)}
          />
        </div>
        <Row label="UV index alerts">
          <Switch checked={advanced.uvAlerts} onCheckedChange={(v) => updAdv("uvAlerts", v)} />
        </Row>
        <Row label="Altitude alerts">
          <Switch checked={advanced.altitudeAlerts} onCheckedChange={(v) => updAdv("altitudeAlerts", v)} />
        </Row>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> Weather
            </Label>
            <Input
              value={advanced.weatherLocation}
              onChange={(e) => updAdv("weatherLocation", e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Units</Label>
            <div className="grid grid-cols-2 gap-1">
              <Button
                size="sm"
                variant={advanced.weatherUnits === "metric" ? "default" : "outline"}
                onClick={() => updAdv("weatherUnits", "metric")}
              >
                °C
              </Button>
              <Button
                size="sm"
                variant={advanced.weatherUnits === "imperial" ? "default" : "outline"}
                onClick={() => updAdv("weatherUnits", "imperial")}
              >
                °F
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Complications */}
      <Section icon={<Layers className="h-4 w-4" />} title="Watch Face Complications" badge="Customize">
        <p className="text-[10px] text-muted-foreground">
          Choose what appears in each corner of your active watch face.
        </p>
        {(["top", "bottom", "left", "right"] as ComplicationSlot[]).map((slot) => (
          <div key={slot} className="space-y-1.5">
            <Label className="text-xs capitalize">{slot} slot</Label>
            <div className="flex flex-wrap gap-1.5">
              {COMPLICATION_LIBRARY.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSlot(slot, c.id)}
                  className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                    complications[slot] === c.id
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border/30 bg-muted/20 text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </Section>

      {/* Alarms */}
      <Section icon={<AlarmClock className="h-4 w-4" />} title="Alarms & Reminders">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label className="text-xs">Label</Label>
            <Input
              placeholder="Morning workout"
              value={newAlarmLabel}
              onChange={(e) => setNewAlarmLabel(e.target.value)}
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Time</Label>
            <Input type="time" value={newAlarmTime} onChange={(e) => setNewAlarmTime(e.target.value)} className="h-9" />
          </div>
          <Button size="sm" onClick={addAlarm}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {alarms.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">No alarms yet.</p>
        ) : (
          alarms.map((a) => (
            <div key={a.id} className="rounded-xl border border-border/30 bg-muted/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold tabular-nums text-foreground">{a.time}</div>
                  <div className="text-[10px] text-muted-foreground">{a.label}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={a.enabled}
                    onCheckedChange={(v) =>
                      setAlarms((prev) => prev.map((x) => (x.id === a.id ? { ...x, enabled: v } : x)))
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setAlarms((prev) => prev.filter((x) => x.id !== a.id))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-1">
                {DAYS.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => toggleDay(a.id, i)}
                    className={`h-7 w-7 rounded-full text-[10px] font-semibold transition-colors ${
                      a.days.includes(i)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <Row label="Smart wake" hint="Wake during light sleep window">
                <Switch
                  checked={a.smartWake}
                  onCheckedChange={(v) =>
                    setAlarms((prev) => prev.map((x) => (x.id === a.id ? { ...x, smartWake: v } : x)))
                  }
                />
              </Row>
            </div>
          ))
        )}
      </Section>

      {/* Apps & Extras */}
      <Section icon={<Music className="h-4 w-4" />} title="Watch Apps">
        <Row label="Media controls" hint="Skip, pause & volume from wrist">
          <Switch checked={advanced.mediaControls} onCheckedChange={(v) => updAdv("mediaControls", v)} />
        </Row>
        <Row label="Camera remote">
          <Switch checked={advanced.cameraRemote} onCheckedChange={(v) => updAdv("cameraRemote", v)} />
        </Row>
        <Row label="Flashlight">
          <Switch checked={advanced.flashlight} onCheckedChange={(v) => updAdv("flashlight", v)} />
        </Row>
        <Row label="Walkie-talkie">
          <Switch checked={advanced.walkieTalkie} onCheckedChange={(v) => updAdv("walkieTalkie", v)} />
        </Row>
        <Row label="Card wallet">
          <Switch checked={advanced.cardWallet} onCheckedChange={(v) => updAdv("cardWallet", v)} />
        </Row>
        <Row label="Contactless payments" hint="NFC tap-to-pay">
          <Switch checked={advanced.contactlessPayments} onCheckedChange={(v) => updAdv("contactlessPayments", v)} />
        </Row>
      </Section>
    </>
  );
};

export default SmartwatchSettingsExtras;
