import { getSession } from "~/sessions.server";
import type { Route } from "./+types/index";
import { redirect, useLoaderData, useNavigate } from "react-router";
import { ConexionApi } from "~/services/conexionApi";
import type { Provider, ProvidersResponse } from "~/interfaces/provider";
import Pagination from "~/components/Pagination";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import ViewProvider from "~/components/providers/ViewProvider";
import DeleteProvider from "~/components/providers/DeleteProvider";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Proveedores" },
    { name: "description", content: "Administración de proveedores" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "1";

  if (!session.has("userId")) {
    return redirect("/login");
  }

  try {
    const { data } = await ConexionApi.get<ProvidersResponse>("/providers", {
      params: {
        page: page,
        limit: 10,
      },
      headers: {
        Authorization: `Bearer ${session.get("token")}`,
        "Content-Type": "application/json",
      },
    });

    return {
      providers: data.data,
      links: data.links,
      meta: data.meta,
      token: session.get("token"),
      currentPage: parseInt(page, 10),
    };
  } catch (error) {
    console.error("Error fetching providers:", error);
    return {
      providers: [],
      links: null,
      meta: null,
    };
  }
}

export default function Index() {
  const navigate = useNavigate();

  const loaderData = useLoaderData<typeof loader>();
  const providers = loaderData?.providers ?? [];
  const links = loaderData?.links;
  const meta = loaderData?.meta;
  const token = loaderData?.token;
  const currentPage = loaderData?.currentPage || 1;
  console.log(currentPage, "currentPage");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );

  const handlePageChange = (page: number) => {
    navigate(`/providers?page=${page}`);
  };

  const handleView = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const onCloseModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedProvider(null);
  };

  const handleDelete = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsDeleteModalOpen(true);
  };

  return (
    // Contenedor principal con padding consistente
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">
                      {provider.name}
                    </TableCell>
                    <TableCell>{provider.email}</TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={provider.address}>
                      {provider.address}
                    </TableCell>
                    <TableCell>{provider.phone}</TableCell>
                    <TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleView(provider)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                            // onClick={() => handleEdit(provider)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(provider)}
                              className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination con el mismo padding que el contenedor */}
      <Pagination
        currentPage={meta?.current_page || 1}
        totalPages={meta?.last_page || 1}
        totalItems={meta?.total || 0}
        itemsPerPage={meta?.per_page || 10}
        onPageChange={handlePageChange}
      />

      <ViewProvider
        provider={selectedProvider}
        isOpen={isModalOpen}
        onClose={onCloseModal}
      />

      <DeleteProvider
        provider={selectedProvider}
        isOpen={isDeleteModalOpen}
        onClose={onCloseModal}
        token={token}
        currentPage={currentPage}
      />
    </div>
  );
}
