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
  isOpen: boolean;
  onClose: () => void;
  currentPage?: number;
  token?: string;
}

export default function ProductCreateModal({
  isOpen,
  onClose,
  currentPage = 1,
  token,
}: ProductEditModalProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

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

  // Función para generar slug automáticamente
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Eliminar caracteres especiales
      .replace(/[\s_-]+/g, "-") // Reemplazar espacios y guiones bajos con guiones
      .replace(/^-+|-+$/g, ""); // Eliminar guiones al inicio y final
  };

  // Observar cambios en el nombre para auto-generar slug
  const watchedName = watch("name");

  useEffect(() => {
    // Solo generar slug automáticamente si no ha sido editado manualmente
    if (watchedName && !slugManuallyEdited) {
      const autoSlug = generateSlug(watchedName);
      setValue("slug", autoSlug);
      // Limpiar error de slug si existe
      if (errors.slug) {
        trigger("slug");
      }
    }
  }, [watchedName, slugManuallyEdited, setValue, trigger, errors.slug]);

  // Manejar cuando el usuario edita el slug manualmente
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    // El register ya maneja el onChange, solo necesitamos marcar como editado manualmente
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!token) return;

    setIsLoading(true);
    try {
      // Convertir is_active a número para la API
      const submitData = {
        ...data,
        is_active: data.is_active ? 1 : 0,
        price: Number(data.price), // Asegurar que price sea número
      };

      const response = await ConexionApi.post(`/products`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        onClose();
        return navigate(`/products?page=${currentPage || 1}`);
      }
    } catch (error: any) {
      console.error(
        "Error creating product:",
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
    setSlugManuallyEdited(false); // Resetear el estado del slug
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create Product
          </DialogTitle>
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
              <Label htmlFor="slug">
                Slug *
                {!slugManuallyEdited && watchedName && (
                  <span className="text-xs text-gray-500 ml-1">
                    (auto-generated)
                  </span>
                )}
              </Label>
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
                onChange={handleSlugChange}
              />
              {errors.slug && (
                <p className="text-sm text-red-500">{errors.slug.message}</p>
              )}
              <p className="text-xs text-gray-500">
                The slug will be auto-generated from the product name. You can
                edit it manually if needed.
              </p>
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
              {isLoading ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
