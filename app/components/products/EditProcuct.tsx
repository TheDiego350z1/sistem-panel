import type { Product } from "~/interfaces/product";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { ConexionApi } from "~/services/conexionApi";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

// Tipos del formulario
interface ProductFormData {
  name: string;
  slug: string;
  price: number;
  description: string;
  is_active: boolean;
}

interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  currentPage?: number;
  token?: string;
}

export default function ProductEditModal({
  product,
  isOpen,
  onClose,
  currentPage = 1,
  token,
}: ProductEditModalProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
    setError,
    watch,
    setValue,
  } = useForm<ProductFormData>({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      price: 0,
      description: "",
      is_active: true,
    },
  });

  // Watch name field para generar slug automáticamente
  const watchedName = watch("name");

  // Función para generar slug
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remover caracteres especiales
      .replace(/[\s_-]+/g, "-") // Reemplazar espacios y guiones bajos con guiones
      .replace(/^-+|-+$/g, ""); // Remover guiones al inicio y final
  };

  // Auto-generar slug cuando cambie el nombre (solo si el slug está vacío o es similar al nombre anterior)
  useEffect(() => {
    if (watchedName && (!product || product.name !== watchedName)) {
      const newSlug = generateSlug(watchedName);
      setValue("slug", newSlug);
    }
  }, [watchedName, setValue, product]);

  // Resetear el formulario cuando cambie el producto
  useEffect(() => {
    if (product && isOpen) {
      const formData = {
        name: product.name || "",
        slug: product.slug || "",
        price: product.price || 0,
        description: product.description || "",
        is_active: Boolean(product.is_active),
        provider_id: product.provider_id || "",
      };
      reset(formData);
      // Trigger validation después del reset
      setTimeout(() => trigger(), 100);
    }
  }, [product, reset, isOpen, trigger]);

  const onSubmit = async (data: ProductFormData) => {
    if (!product || !token) return;

    setIsLoading(true);
    try {
      // Convertir is_active a número para la API
      const submitData = {
        ...data,
        is_active: data.is_active ? 1 : 0,
        price: Number(data.price), // Asegurar que price sea número
      };

      const response = await ConexionApi.put(
        `/products/${product.id}`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        onClose();
        return navigate(`/products?page=${currentPage || 1}`);
      }
    } catch (error: any) {
      console.error(
        "Error updating product:",
        error?.response?.data?.errors || error.message
      );

      // Manejo de errores del servidor
      const apiErrors = error?.response?.data?.errors;

      if (apiErrors && typeof apiErrors === "object") {
        Object.keys(apiErrors).forEach((fieldName) => {
          const fieldErrors = apiErrors[fieldName];
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            setError(fieldName as keyof ProductFormData, {
              type: "server",
              message: fieldErrors[0],
            });
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Product</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Product name is required",
                  minLength: {
                    value: 2,
                    message: "Product name must be at least 2 characters",
                  },
                })}
                placeholder="Enter product name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                {...register("slug", {
                  required: "Slug is required",
                  pattern: {
                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message:
                      "Slug must contain only lowercase letters, numbers, and hyphens",
                  },
                })}
                placeholder="product-slug"
                className={errors.slug ? "border-red-500" : ""}
              />
              {errors.slug && (
                <p className="text-sm text-red-500">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register("price", {
                  required: "Price is required",
                  min: {
                    value: 0,
                    message: "Price must be greater than or equal to 0",
                  },
                  valueAsNumber: true,
                })}
                placeholder="0.00"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="is_active"
                className="flex items-center space-x-2">
                <span>Active Status</span>
              </Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="is_active"
                  {...register("is_active")}
                  onCheckedChange={(checked) => setValue("is_active", checked)}
                />
                <span className="text-sm text-gray-600">
                  {watch("is_active") ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              onClick={() => {
                if (Object.keys(errors).length > 0) {
                  console.log("Validation errors:", errors);
                }
              }}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
