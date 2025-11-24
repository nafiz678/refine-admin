import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CollectionForm } from "../collection-form"
import { Plus } from "lucide-react"
import { CollectionProp } from "../collections"

interface CreateCollectionDialogProps {
  onCreate: (data: Omit<CollectionProp, "id" | "createdAt" | "updatedAt">) => void
}

export function CreateCollectionDialog({ onCreate }: CreateCollectionDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSubmit = (data: Omit<CollectionProp, "id" | "createdAt" | "updatedAt">) => {
    onCreate(data)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
        <Plus className="h-4 w-4" />
        Create New Collection
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription>Add a new product collection to your store</DialogDescription>
        </DialogHeader>
        <CollectionForm onSubmit={handleSubmit} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
