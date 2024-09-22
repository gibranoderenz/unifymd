"use client";

import {
  createPatientRecord,
  getPatient,
  getPatientRecord,
} from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@propelauth/nextjs/client";
import { format } from "date-fns";
import { InferSelectModel } from "drizzle-orm";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { MdGrain } from "react-icons/md";
import Markdown from "react-markdown";
import { toast } from "sonner";
import { z } from "zod";
import { patients, records } from "../../drizzle/schema";
import { createRecordFormSchema } from "./schema";

export default function PatientDataPage({
  params,
}: {
  params: { patientId: string };
}) {
  const [patient, setPatient] = useState<
    | (InferSelectModel<typeof patients> & {
        records: { id: string; createdAt: Date | null }[];
      })
    | null
  >(null);
  const [record, setRecord] = useState<
    | (InferSelectModel<typeof records> & {
        medications: { id: string; name: string; description: string }[];
      })
    | null
  >(null);
  const [messages, setMessages] = useState<
    { id: number; content: string; sender: "user" | "ai" }[]
  >([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const router = useRouter();
  const { loading } = useUser();

  const { patientId } = params;

  const sendMessage = async () => {
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, content: currentMessage, sender: "user" },
    ]);

    try {
      const response = await fetch("/api/bot", {
        method: "POST",
        body: JSON.stringify({ message: currentMessage }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { id: prev.length + 1, content: data.message.output, sender: "ai" },
        ]);
      }
    } catch (err) {
      toast("An error occurred while asking UnifyMD. Try again.");
    }
  };

  useEffect(() => {
    const _getPatient = async () => {
      if (!!patientId) {
        const response = await getPatient(patientId);
        if (response.success) {
          setPatient(response.patient);
        } else {
          router.push("/");
        }
      }
    };

    _getPatient();
  }, []);

  const _getPatientRecord = async (recordId: string) => {
    try {
      const response = await getPatientRecord(recordId);
      if (response.error) {
        throw new Error();
      }
      setRecord(response.record!);
    } catch (err) {
      toast("An error occurred while getting patient record.");
    }
  };

  const createRecordForm = useForm<z.infer<typeof createRecordFormSchema>>({
    resolver: zodResolver(createRecordFormSchema),
    defaultValues: {
      patientId,
    },
  });

  const {
    fields: medicationFields,
    append,
    remove,
  } = useFieldArray({
    control: createRecordForm.control,
    name: "medications" as never,
  });

  const onSubmit = (values: z.infer<typeof createRecordFormSchema>) => {
    createPatientRecord(values).then((response) => {
      if (response.error) {
        toast(
          "An error occurred while creating patient record. Please try again."
        );
      } else {
        toast("Successfully created patient record.");
        window.location.reload();
      }
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center gap-4" style={{ height: "80vh" }}>
      <div className="flex flex-col gap-4 w-1/5">
        <div className="bg-[#F5F5F5] p-2 rounded-xl text-center">
          <span className="font-semibold">Patient Record</span>
        </div>

        <div className="flex flex-col gap-4 bg-[#F8F3FF] p-6 rounded-xl">
          {!!patient &&
            patient.records.map((record) => {
              return (
                <button
                  key={record.id}
                  onClick={() => {
                    _getPatientRecord(record.id);
                  }}
                >
                  {!!record.createdAt &&
                    format(record.createdAt.toString(), "PP")}
                </button>
              );
            })}
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button className="bg-[#381E72] rounded-xl">Add New Record</Button>
          </SheetTrigger>
          <SheetContent className="flex flex-col gap-4 overflow-auto">
            <SheetHeader>
              <SheetTitle>
                Add a new record for {patient?.firstName} {patient?.lastName}
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-4">
              <Form {...createRecordForm}>
                <form
                  onSubmit={createRecordForm.handleSubmit(onSubmit)}
                  className="flex flex-col gap-8"
                >
                  <FormField
                    control={createRecordForm.control}
                    name="eventName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event name</FormLabel>
                        <FormControl>
                          <Input placeholder="Example: Visit note" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createRecordForm.control}
                    name="healthFacility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Health facility</FormLabel>
                        <FormControl>
                          <Input placeholder="Example: Hospital A" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createRecordForm.control}
                    name="symptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symptoms</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Example: Cold, sore throat"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createRecordForm.control}
                    name="initialSymptomTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createRecordForm.control}
                    name="symptomSeverityDegree"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Symptom severity degree</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Example: Low/Moderate/Critical"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createRecordForm.control}
                    name="pastYearMajorIllness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Major illness in the past year</FormLabel>
                        <FormControl>
                          <Input placeholder="Example: Typhus" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createRecordForm.control}
                    name="takenMedications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taken medications</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Example: Lanzoprazole, Ibuprofen"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createRecordForm.control}
                    name="militaryServiceStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Military service status</FormLabel>
                        <FormControl>
                          <Input placeholder="Example: Veteran" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createRecordForm.control}
                    name="sexualActivity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sexual activity</FormLabel>
                        <FormControl>
                          <Input placeholder="Example: None" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createRecordForm.control}
                    name="alcoholUsage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alcohol usage</FormLabel>
                        <FormControl>
                          <Input placeholder="Example: None" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createRecordForm.control}
                    name="smokeUsage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Smoke usage</FormLabel>
                        <FormControl>
                          <Input placeholder="Example: None" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Medications</span>
                    <Button
                      type="button"
                      onClick={() => {
                        append({ name: "", description: "" });
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-col gap-8">
                    {medicationFields.map((field, index) => {
                      return (
                        <div key={field.id} className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              Medication {index + 1}
                            </span>
                            <Button
                              type="button"
                              className="bg-red-700"
                              onClick={() => {
                                remove(index);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                          <FormField
                            control={createRecordForm.control}
                            name={`medications.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Example: Lanzoprazole"
                                    {...field}
                                  />
                                </FormControl>

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createRecordForm.control}
                            name={`medications.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Example: 2 times per day"
                                    {...field}
                                  />
                                </FormControl>

                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <Button type="submit">Submit</Button>
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex flex-col gap-4 w-2/3">
        <div className="p-4 rounded-xl bg-[#F5F5F5]">
          <h1 className="text-2xl font-bold">
            {patient?.firstName} {patient?.lastName}
          </h1>
        </div>
        <div className="flex flex-col gap-4 bg-[#F8F3FF] p-4 rounded-xl">
          {!record ? (
            <span>Select a record to view its details.</span>
          ) : (
            <div className="flex flex-col gap-4">
              <span className="text-xl font-bold text-[#381E72]">
                {!!record.createdAt && format(record.createdAt, "PPP")} -{" "}
                {record.eventName}
              </span>
              <div className="flex justify-center gap-4 w-full">
                <div className="flex flex-col gap-4 w-1/2">
                  <div className="flex flex-col gap-2 bg-white p-4 rounded-xl">
                    <span className="text-xl font-semibold">Symptoms</span>
                    <span>{record.symptoms}</span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#381E72]">
                        Time the symptoms started
                      </Badge>
                      <span className="text-sm">
                        {format(record.initialSymptomTime, "PPP")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#381E72]">Symptom severity</Badge>
                      <span className="text-sm">
                        {record.symptomSeverityDegree}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 bg-white p-4 rounded-xl">
                    <span className="text-xl font-semibold">Illness</span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#381E72]">
                        Major illness in the past year
                      </Badge>
                      <span className="text-sm">
                        {record.pastYearMajorIllness}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#381E72]">
                        History of illness in family
                      </Badge>
                      <span className="text-sm">
                        {patient?.familyIllnessHistory}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 bg-white p-4 rounded-xl">
                    <span className="text-xl font-semibold">Others</span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#381E72]">
                        Status of Military Service
                      </Badge>
                      <span className="text-sm">
                        {record.militaryServiceStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#381E72]">Sexual Activity</Badge>
                      <span className="text-sm">{record?.sexualActivity}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 bg-white p-4 rounded-xl w-1/2">
                  <span className="text-xl font-semibold">Medications</span>
                  <div className="flex flex-col gap-4 bg-[#381E72] text-white p-4 rounded-2xl">
                    {record.medications.length > 0 ? (
                      record.medications.map((medication) => {
                        return (
                          <div
                            key={medication.id}
                            className="flex flex-col gap-2"
                          >
                            <span className="text-lg font-semibold">
                              {medication.name}
                            </span>
                            <span>{medication.description}</span>
                          </div>
                        );
                      })
                    ) : (
                      <span>No medications given.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex flex-col justify-between p-8 bg-[#F8F3FF] w-1/3 rounded-xl overflow-auto">
        <div className="flex items-center gap-2">
          <MdGrain
            size={22}
            className="bg-[#381E72] text-white rounded-full p-[2px]"
          />
          <span className="text-lg text-[#381E72] font-semibold">
            UnifyMD - Your Assistant
          </span>
        </div>

        <div className="flex flex-col gap-4 py-8">
          {messages.map((message) => {
            return (
              <span
                key={message.id}
                className={`p-4 rounded-xl ${
                  message.sender === "user"
                    ? "bg-white text-black self-end w-4/5"
                    : "bg-[#381E72] text-white self-start w-4/5"
                }`}
              >
                <Markdown>{message.content}</Markdown>
              </span>
            );
          })}
        </div>

        <Input
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          onChange={(e) => {
            setCurrentMessage(e.target.value);
          }}
          className="bg-white rounded-2xl -bottom-5 sticky p-4"
          placeholder="Search about this patient..."
        />
      </div>
    </div>
  );
}
