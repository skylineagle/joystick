import { AddCardDialog } from "@/components/dashboard/add-card-dialog";
import { CardFactory } from "@/components/dashboard/cards/card-factory";
import { EditCardDialog } from "@/components/dashboard/edit-card-dialog";
import { AnimatedThemeToggle } from "@/components/ui/animated-theme-toggle";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { CardType, type CardConfig } from "@/types/dashboard-cards";
import {
  ArrowLeft,
  Grid3X3,
  Plus,
  LayoutDashboard,
  Settings,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useCallback, useState } from "react";
import { Link } from "react-router";
import {
  Responsive,
  WidthProvider,
  type Layout,
  type Layouts,
} from "react-grid-layout";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ResponsiveGridLayout = WidthProvider(Responsive);

const initialLayouts: Layouts = { lg: [] };
const initialCards: CardConfig[] = [];

const CARD_SIZES: Record<
  CardType,
  {
    w: number;
    h: number;
  }
> = {
  // Stream cards - large by default, highly resizable for importance/visibility
  [CardType.STREAM_VIEW]: { w: 12, h: 16 },

  // Status cards - compact by default, can be made larger for emphasis
  [CardType.BATTERY_STATUS]: { w: 4, h: 8 },
  [CardType.CELL_STATUS]: { w: 4, h: 8 },
  [CardType.IMU_STATUS]: { w: 4, h: 8 },

  // Control cards - sized to fit controls, expandable for better interaction
  [CardType.ACTION_RUNNER]: { w: 4, h: 4 },
  [CardType.PING_CONTROL]: { w: 6, h: 12 },
  [CardType.PTZ_CONTROL]: { w: 6, h: 16 },

  // Data cards - medium size, highly customizable for user workflow
  [CardType.LOCATION]: { w: 8, h: 12 },
  [CardType.PARAM_VALUE_EDITOR]: {
    w: 6,
    h: 8,
  },
};

// All cards are now resizable to give users full control over importance/visibility

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

        let maxY = 0;
        prevLgLayout.forEach((item) => {
          const itemBottom = item.y + item.h;
          maxY = Math.max(maxY, itemBottom);
        });

        const newLayoutItem: Layout = {
          i: newCard.id,
          x: 0,
          y: maxY,
          w: defaultSize.w,
          h: defaultSize.h,
          // minW: defaultSize.minW,
          // minH: defaultSize.minH,
          // maxW: defaultSize.maxW,
          // maxH: defaultSize.maxH,
          isResizable: true, // All cards are now resizable
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

  const handleClearDashboard = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to remove all cards? This action cannot be undone."
      )
    ) {
      setCards([]);
      setLayouts(initialLayouts);
    }
  }, [setCards, setLayouts]);

  const handleCompactLayout = useCallback(() => {
    setLayouts((prevLayouts) => {
      const lgLayout = prevLayouts.lg || [];
      const sortedLayout = [...lgLayout].sort((a, b) => {
        if (a.y === b.y) return a.x - b.x;
        return a.y - b.y;
      });

      let currentY = 0;
      const compactedLayout = sortedLayout.map((item) => {
        const newItem = { ...item, x: 0, y: currentY };
        currentY += item.h;
        return newItem;
      });

      return { ...prevLayouts, lg: compactedLayout };
    });
  }, [setLayouts]);

  const EmptyDashboard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] space-y-6"
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border-4 border-dashed border-muted-foreground/30"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <LayoutDashboard className="w-8 h-8 text-muted-foreground" />
        </div>
      </div>

      <div className="text-center space-y-3">
        <h3 className="text-xl font-semibold text-foreground">
          Your Dashboard is Empty
        </h3>
        <p className="text-muted-foreground max-w-md">
          Start building your personalized dashboard by adding cards. Monitor
          your devices, control systems, and view real-time data all in one
          place.
        </p>
      </div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <AddCardDialog onAddCard={handleAddCard}>
          <Button
            size="lg"
            className="shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Card
          </Button>
        </AddCardDialog>
      </motion.div>
    </motion.div>
  );

  const QuickSettings = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCompactLayout} disabled={!isEditing}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Compact Layout
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleClearDashboard}
          disabled={cards.length === 0}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Dashboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50 shadow-sm"
      >
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link
                to="/"
                className="flex items-center gap-2 hover:bg-accent/50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <Grid3X3 className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Dashboard
              </h1>
              {cards.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {cards.length} {cards.length === 1 ? "card" : "cards"}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <AddCardDialog onAddCard={handleAddCard} />
                </motion.div>
              )}
            </AnimatePresence>

            {cards.length > 0 && <QuickSettings />}

            <div className="flex items-center space-x-3 bg-accent/30 rounded-lg px-3 py-2">
              <Switch
                id="edit-mode-switch"
                checked={isEditing}
                onCheckedChange={setIsEditing}
              />
              <Label htmlFor="edit-mode-switch" className="font-medium text-sm">
                Edit Mode
              </Label>
            </div>
            <AnimatedThemeToggle />
          </div>
        </div>
      </motion.header>

      <main className="p-6">
        <AnimatePresence mode="wait">
          {cards.length === 0 ? (
            <EmptyDashboard />
          ) : (
            <motion.div
              key="dashboard-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 }}
                autoSize
                rowHeight={10}
                margin={[8, 8]}
                onLayoutChange={handleLayoutChange}
                draggableHandle=".drag-handle"
                isDraggable={isEditing}
                isResizable={isEditing}
                containerPadding={[0, 0]}
                compactType="vertical"
                preventCollision={false}
                useCSSTransforms={true}
                resizeHandles={["se"]}
              >
                {cards.map((card, index) => {
                  const layoutItem = layouts.lg?.find((l) => l.i === card.id);

                  return (
                    <div
                      key={card.id}
                      data-grid={{
                        ...layoutItem,
                        isResizable: true,
                      }}
                      className={isEditing ? "hover:z-10" : ""}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 100,
                        }}
                        className="w-full h-full"
                      >
                        <CardFactory
                          config={card}
                          isEditing={isEditing}
                          onEdit={handleOpenEditModal}
                        />
                      </motion.div>
                    </div>
                  );
                })}
              </ResponsiveGridLayout>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

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
