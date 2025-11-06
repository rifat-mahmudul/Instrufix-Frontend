"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Plus, Trash2 } from "lucide-react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

// Instrument type interface
interface InstrumentType {
  _id: string
  type: string
  serviceType: string[]
}

// Instrument family interface
interface InstrumentFamily {
  _id: string
  instrumentFamily: string
  instrumentTypes: InstrumentType[]
  createdAt: string
  updatedAt: string
  __v: number
}

// API response interface
interface ApiResponse {
  success: boolean
  code: number
  message: string
  data: InstrumentFamily[]
}

export default function InstrumentService() {
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("")
  const [selectedTypeId, setSelectedTypeId] = useState<string>("")
  const [serviceTypes, setServiceTypes] = useState<string[]>([""])

  // Fetch instrument families
  const { data: instrumentFamiliesRaw, isLoading, isError, error } = useQuery({
    queryKey: ["instrumentFamilies"],
    queryFn: async (): Promise<InstrumentFamily[]> => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/instrument-family`)
      if (!response.ok) throw new Error("Failed to fetch instrument families")
      const data: ApiResponse = await response.json()
      return data.data
    },
  })

  const instrumentFamilies: InstrumentFamily[] = Array.isArray(instrumentFamiliesRaw) ? instrumentFamiliesRaw : []

  // Mutation to update service types
  const mutation = useMutation({
    mutationFn: async (newServiceTypes: string[]) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/instrument-family/${selectedFamilyId}/type/${selectedTypeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceType: newServiceTypes }),
      })
      if (!response.ok) throw new Error("Failed to update service types")
      const data: ApiResponse = await response.json()
      return data
    },
    onSuccess: () => {
      toast.success("Service types added successfully!")
      setServiceTypes([""]) // reset
      setSelectedType("")
      setSelectedFamilyId("")
      setSelectedTypeId("")
    },
    onError: (error: Error) => {
      toast.error(`Failed to add service types: ${error.message}`)
    },
  })

  // Handle input change
  const handleServiceTypeChange = (index: number, value: string) => {
    const newTypes = [...serviceTypes]
    newTypes[index] = value
    setServiceTypes(newTypes)
  }

  // Add new input
  const addServiceType = () => setServiceTypes([...serviceTypes, ""])

  // Remove input
  const removeServiceType = (index: number) => {
    const newTypes = serviceTypes.filter((_, i) => i !== index)
    setServiceTypes(newTypes.length > 0 ? newTypes : [""])
  }

  // Handle publish
  const handleSubmit = () => {
    const validTypes = serviceTypes.filter((t) => t.trim() !== "")
    if (!selectedFamilyId || !selectedTypeId) return toast.error("Please select an instrument type")
    if (validTypes.length === 0) return toast.error("Please add at least one service type")
    mutation.mutate(validTypes)
  }

  return (
    <div>
      {/* Dropdown */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-900 mb-2">Instrument Type</label>
        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => {
              const [familyId, typeId] = e.target.value.split("||")
              const selectedFamily = instrumentFamilies.find(f => f._id === familyId)
              const selectedInstrumentType = selectedFamily?.instrumentTypes.find(t => t._id === typeId)
              
              setSelectedType(e.target.value)
              setSelectedFamilyId(familyId || "")
              setSelectedTypeId(typeId || "")
              setServiceTypes(
                selectedInstrumentType?.serviceType.length
                  ? [...selectedInstrumentType.serviceType, ""]
                  : [""]
              )
            }}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-[#139a8e]-500 focus:border-[#139a8e]-500 text-gray-900"
            disabled={isLoading || isError}
          >
            <option value="">Select Instrument Type</option>
            {instrumentFamilies.map(family =>
              family.instrumentTypes.map(type => (
                <option key={type._id} value={`${family._id}||${type._id}||${type.type}`}>
                  {type.type}
                </option>
              ))
            )}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        {isLoading && <p className="text-sm text-gray-500 mt-2">Loading instrument types...</p>}
        {isError && <p className="text-sm text-red-500 mt-2">Error: {error?.message}</p>}
      </div>

      {/* Service Types */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Service Types</h2>

        {serviceTypes.map((serviceType, index) => (
          <div key={index} className="mb-4 flex items-center gap-2">
            <input
              type="text"
              value={serviceType}
              onChange={e => handleServiceTypeChange(index, e.target.value)}
              placeholder="Add service type..."
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#139a8e]-500 focus:border-[#139a8e]-500 text-gray-900 placeholder-gray-400"
            />
            {serviceTypes.length > 1 && (
              <Button variant="outline" size="icon" onClick={() => removeServiceType(index)} className="border-gray-300">
                <Trash2 className="w-5 h-5 text-gray-400" />
              </Button>
            )}
          </div>
        ))}

        {/* Add input button */}
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg py-3 px-4 flex items-center justify-center mb-6">
          <Button variant="ghost" size="icon" onClick={addServiceType} className="hover:bg-gray-100">
            <Plus className="w-8 h-8 text-gray-400 mx-auto" />
          </Button>
        </div>
      </div>

      {/* Publish */}
      <Button
        className="w-full bg-[#139a8e] hover:bg-[#139a8e] text-white py-3 rounded-md font-medium"
        onClick={handleSubmit}
        disabled={mutation.status === 'pending' || isError}
      >
        {mutation.status === 'pending' ? "Publishing..." : "Publish"}
      </Button>
    </div>
  )
}