import { AddCardDialog } from "@/components/dashboard/add-card-dialog";
import { CardFactory } from "@/components/dashboard/cards/card-factory";
import { EditCardDialog } from "@/components/dashboard/edit-card-dialog";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { CardType, type CardConfig } from "@/types/dashboard-cards";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useCallback, useState } from "react";
import {
  Responsive,
  WidthProvider,
  type Layout,
  type Layouts,
} from "react-grid-layout";
import { v4 as uuidv4 } from "uuid";

const ResponsiveGridLayout = WidthProvider(Responsive);

const initialLayouts: Layouts = { lg: [] };
const initialCards: CardConfig[] = [];

const CARD_SIZES: Record<CardType, { w: number; h: number }> = {
  [CardType.STREAM_VIEW]: { w: 4, h: 3 },
  [CardType.BATTERY_STATUS]: { w: 2, h: 3 },
  [CardType.CELL_STATUS]: { w: 2, h: 3 },
  [CardType.LOCATION]: { w: 4, h: 4 },
  [CardType.IMU_STATUS]: { w: 2, h: 3 },
  [CardType.ACTION_RUNNER]: { w: 2, h: 1 },
  [CardType.PARAM_VALUE_EDITOR]: { w: 3, h: 2 },
};

export const DashboardPage = () => {
  const [isEditing, setIsEditing] = useQueryState(
    "edit",
    parseAsBoolean.withDefault(false)
  );
  const [cards, setCards] = useLocalStorage<CardConfig[]>(
    "dashboardCards",
    initialCards
  );
  const [layouts, setLayouts] = useLocalStorage<Layouts>(
    "dashboardLayouts",
    initialLayouts
  );
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const isEditModalOpen = !!editingCardId;
  const cardBeingEdited = cards.find((card) => card.id === editingCardId);

  const handleLayoutChange = useCallback(
    (_currentLayout: Layout[], allLayouts: Layouts) => {
      if (!isEditing) return;

      if (JSON.stringify(allLayouts) !== JSON.stringify(layouts)) {
        setLayouts(allLayouts);
      }
    },
    [setLayouts, layouts, isEditing]
  );

  const handleAddCard = useCallback(
    (newCardConfig: Omit<CardConfig, "id">) => {
      const newCard = {
        ...newCardConfig,
        id: uuidv4(),
      } as CardConfig;

      setCards((prevCards) => [...prevCards, newCard]);

      setLayouts((prevLayouts) => {
        const defaultSize = CARD_SIZES[newCard.type];
        const prevLgLayout = prevLayouts.lg || [];

        // Calculate the next available position
        let maxY = 0;
        prevLgLayout.forEach((item) => {
          const itemBottom = item.y + item.h;
          maxY = Math.max(maxY, itemBottom);
        });

        const newLayoutItem: Layout = {
          i: newCard.id,
          x: 0, // Always start from the left
          y: maxY, // Place below existing cards
          w: defaultSize.w,
          h: defaultSize.h,
        };

        return {
          ...prevLayouts,
          lg: [...prevLgLayout, newLayoutItem],
        };
      });
    },
    [setCards, setLayouts]
  );

  const handleDeleteCard = useCallback(
    (cardId: string) => {
      setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
      setLayouts((prevLayouts) => {
        const newLgLayout = (prevLayouts.lg || []).filter(
          (item) => item.i !== cardId
        );
        return { ...prevLayouts, lg: newLgLayout };
      });
      setEditingCardId(null);
    },
    [setCards, setLayouts]
  );

  const handleOpenEditModal = useCallback(
    (cardId: string) => {
      if (!isEditing) return;
      setEditingCardId(cardId);
    },
    [isEditing]
  );

  const handleCloseEditModal = useCallback(() => {
    setEditingCardId(null);
  }, []);

  const handleSaveCard = useCallback(
    (updatedCardConfig: CardConfig) => {
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === updatedCardConfig.id ? updatedCardConfig : card
        )
      );
      handleCloseEditModal();
    },
    [setCards, handleCloseEditModal]
  );

  return (
    <div className="min-h-screen">
      <header className="flex justify-between items-center px-6 py-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          {isEditing && <AddCardDialog onAddCard={handleAddCard} />}
          <div className="flex items-center space-x-4">
            <Switch
              id="edit-mode-switch"
              checked={isEditing}
              onCheckedChange={setIsEditing}
            />
            <Label htmlFor="edit-mode-switch" className="font-medium">
              Edit Mode
            </Label>
          </div>
          <AnimatedThemeToggle />
        </div>
      </header>

      <div className="p-6">
        <div className="relative">
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            autoSize
            rowHeight={100}
            margin={[10, 10]}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".drag-handle"
            isDraggable={isEditing}
            isResizable={isEditing}
            containerPadding={[0, 0]}
          >
            {cards.map((card) => (
              <div
                key={card.id}
                data-grid={layouts.lg?.find((l) => l.i === card.id)}
              >
                <CardFactory
                  config={card}
                  isEditing={isEditing}
                  onEdit={handleOpenEditModal}
                />
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      </div>

      {cardBeingEdited && (
        <EditCardDialog
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          cardConfig={cardBeingEdited}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
        />
      )}
    </div>
  );
};
