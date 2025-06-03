import { getSession } from "~/sessions.server";
import type { Route } from "../products/+types";

import { redirect, useNavigate } from "react-router";
import { ConexionApi } from "~/services/conexionApi";

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
import type { Product, ProductsResponse } from "~/interfaces/product";

//modals
import ViewProductModal from "~/components/products/ViewProduct";
import DeleteProductModal from "~/components/products/DelteProduct";
import ProductEditModal from "~/components/products/EditProcuct";
import ProductCreateModal from "~/components/products/CreateProduct";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Productos" },
    { name: "description", content: "Administración de productos" },
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
    const { data } = await ConexionApi.get<ProductsResponse>("/products", {
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
      products: data.data,
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

export default function Index({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  console.log("Index actionData:", actionData);
  const navigate = useNavigate();

  const {
    products = [],
    links = null,
    meta = null,
    token,
    currentPage = 1,
  } = loaderData || {};

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handlePageChange = (page: number) => {
    navigate(`/products?page=${page}`);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const onCloseModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsEditModalOpen(false);
    setIsCreateModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  return (
    // Contenedor principal con padding consistente
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Providers</CardTitle>
          <div className="flex justify-end">
            <Button onClick={handleCreate}>Create Product</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.slug}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {product.price}
                    </TableCell>
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
                              onClick={() => handleView(product)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEdit(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(product)}
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

      <ViewProductModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        product={selectedProduct}
      />

      <DeleteProductModal
        product={selectedProduct}
        isOpen={isDeleteModalOpen}
        onClose={onCloseModal}
        token={token}
        currentPage={currentPage}
      />

      <ProductEditModal
        product={selectedProduct}
        isOpen={isEditModalOpen}
        onClose={onCloseModal}
        token={token}
        currentPage={currentPage}
      />

      <ProductCreateModal
        isOpen={isCreateModalOpen}
        onClose={onCloseModal}
        token={token}
        currentPage={currentPage}
      />
    </div>
  );
}
