import type { Provider } from "~/interfaces/provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ConexionApi } from "~/services/conexionApi";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

// Tipos del formulario
interface ProviderFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
}

interface ProviderEditModalProps {
  provider: Provider | null;
  isOpen: boolean;
  onClose: () => void;
  currentPage?: number;
  token?: string;
}

export default function ProviderEditModal({
  provider,
  isOpen,
  onClose,
  currentPage = 1,
  token,
}: ProviderEditModalProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
    setError,
  } = useForm<ProviderFormData>({
    mode: "onBlur", // Cambiar a onBlur para mejor UX
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      description: "",
    },
  });

  // Resetear el formulario cuando cambie el provider
  useEffect(() => {
    if (provider && isOpen) {
      const formData = {
        name: provider.name || "",
        email: provider.email || "",
        phone: provider.phone || "",
        address: provider.address || "",
        description: provider.description || "",
      };
      reset(formData);
      // Trigger validation después del reset
      setTimeout(() => trigger(), 100);
    }
  }, [provider, reset, isOpen, trigger]);

  const onSubmit = async (data: ProviderFormData) => {
    if (!provider || !token) return;

    setIsLoading(true);
    try {
      const response = await ConexionApi.put(
        `/providers/${provider.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        onClose();

        return navigate(`/providers?page=${currentPage || 1}`);
      }
    } catch (error: any) {
      console.error(
        "Error updating provider:",
        error?.response?.data?.errors || error.message
      );

      // Manejo de errores del servidor
      const apiErrors = error?.response?.data?.errors;

      //Pensar en optimizar manejo de errores de la api para el formato de react-hook-form
      if (apiErrors && typeof apiErrors === "object") {
        Object.keys(apiErrors).forEach((fieldName) => {
          const fieldErrors = apiErrors[fieldName];
          if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
            setError(fieldName as keyof ProviderFormData, {
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

  if (!provider) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Provider
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Provider Name *</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Provider name is required",
                })}
                placeholder="Enter provider name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email is required",
                })}
                placeholder="Enter email address"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                {...register("phone", {
                  required: "Phone number is required",
                })}
                placeholder="Enter phone number"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                {...register("address", {
                  required: "Address is required",
                })}
                placeholder="Enter address"
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter provider description"
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
                // Forzar validación antes del submit si hay errores
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
