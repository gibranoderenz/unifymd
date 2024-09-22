"use client";

import { Chat } from "@/components/chat";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DataTable } from "@/components/ui/data-table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createPatient, getPatients } from "./actions";
import { patientColumns } from "./patients/columns";
import { createPatientSchema } from "./schema";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [patientsData, setPatientsData] = useState<
    {
      id: string;
      name: string;
      updatedAt: Date | null;
      dateOfBirth: Date;
      sex: string;
    }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    const _getPatients = async () => {
      setIsLoading(true);
      const response = await getPatients();
      if (response.success) {
        const finalData = response.patients.map((patient) => {
          const { firstName, lastName, ...rest } = patient;
          return { ...rest, name: `${firstName} ${lastName}` };
        });

        setPatientsData(finalData);
      } else {
        router.push("/");
      }
      setIsLoading(false);
    };

    _getPatients();
  }, []);

  const onSubmit = (values: z.infer<typeof createPatientSchema>) => {
    createPatient(values).then((response) => {
      if (response.error) {
        toast(
          "An error occurred while adding patient record. Please try again."
        );
      } else {
        toast("Successfully added patient.");
        window.location.reload();
      }
    });
  };

  const createPatientForm = useForm<z.infer<typeof createPatientSchema>>({
    resolver: zodResolver(createPatientSchema),
  });

  return (
    <div className="flex justify-center gap-4">
      <div className="flex flex-col gap-8 w-2/3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl text-[#381E72] font-bold">My Patients</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="bg-[#381E72] hover:bg-[#381E72]/90">
                Add New Patient
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col gap-4 overflow-auto">
              <SheetHeader>
                <SheetTitle>Add a new patient</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4">
                <Form {...createPatientForm}>
                  <form
                    onSubmit={createPatientForm.handleSubmit(onSubmit)}
                    className="flex flex-col gap-8"
                  >
                    <FormField
                      control={createPatientForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First name</FormLabel>
                          <FormControl>
                            <Input placeholder="Example: John" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createPatientForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last name</FormLabel>
                          <FormControl>
                            <Input placeholder="Example: Doe" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createPatientForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Example: john@example.com"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createPatientForm.control}
                      name="dateOfBirth"
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
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
                      control={createPatientForm.control}
                      name="sex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sex</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Male">Male</SelectItem>
                            </SelectContent>
                          </Select>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createPatientForm.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Allergies</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Example: Peanut butter"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createPatientForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Example: 123-1234-1234"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createPatientForm.control}
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Example: 123-1234-1234"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createPatientForm.control}
                      name="familyIllnessHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>History of family illness</FormLabel>
                          <FormControl>
                            <Input placeholder="Example: None" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createPatientForm.control}
                      name="familySymptomsHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>History of family symptoms</FormLabel>
                          <FormControl>
                            <Input placeholder="Example: None" {...field} />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit">Submit</Button>
                  </form>
                </Form>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        {isLoading ? (
          <span>Loading patients data...</span>
        ) : (
          <DataTable columns={patientColumns} data={patientsData} />
        )}
      </div>
      <Chat />
    </div>
  );
}
