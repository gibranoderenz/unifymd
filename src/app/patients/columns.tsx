"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, formatDistance } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { deletePatient } from "../actions";

export type PatientRow = {
  id: string;
  name: string;
  updatedAt: Date | null;
  dateOfBirth: Date;
  sex: string;
};

export const patientColumns: ColumnDef<PatientRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Updated" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as string;
      const formattedDate = formatDistance(date, new Date(), {
        addSuffix: true,
      });
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "dateOfBirth",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date of Birth" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("dateOfBirth") as Date;
      const formattedDate = format(date, "PP");
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "sex",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sex" />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/patients/${patient.id}`}>View Patient Data</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-700"
              onClick={() => {
                deletePatient(patient.id);
                toast("Patient successfully deleted.");
                window.location.reload();
              }}
            >
              Delete Patient
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
