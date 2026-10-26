from PIL import Image, ImageDraw, ImageFont
import os

def create_system_architecture_diagram(output_path):
    width = 1200
    height = 560
    img = Image.new('RGB', (width, height), color=(255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Try loading system font or fallback to default
    try:
        font_title = ImageFont.truetype("arialbd.ttf", 22)
        font_box_title = ImageFont.truetype("arialbd.ttf", 15)
        font_box_desc = ImageFont.truetype("arial.ttf", 12)
    except:
        font_title = font_box_title = font_box_desc = ImageFont.load_default()

    # Draw Title
    title_text = "System Architecture: Sentinel Next-Gen Firewall & Intrusion Detection System"
    draw.text((220, 25), title_text, fill=(15, 23, 42), font=font_title)

    # Box drawing helper
    def draw_box(x, y, w, h, bg_color, border_color, title, desc, title_color=(15, 23, 42)):
        # Rounded rectangle
        draw.rounded_rectangle([x, y, x + w, y + h], radius=12, fill=bg_color, outline=border_color, width=2)
        # Title text centered
        draw.text((x + 16, y + 14), title, fill=title_color, font=font_box_title)
        # Description text
        lines = desc.split("\n")
        curr_y = y + 42
        for line in lines:
            draw.text((x + 16, curr_y), line, fill=(71, 85, 105), font=font_box_desc)
            curr_y += 18

    # Arrow drawing helper
    def draw_arrow(start_x, start_y, end_x, end_y, color=(71, 85, 105)):
        draw.line([start_x, start_y, end_x, end_y], fill=color, width=2)
        # Arrowhead
        if end_x > start_x:
            draw.polygon([
                (end_x, end_y),
                (end_x - 8, end_y - 5),
                (end_x - 8, end_y + 5)
            ], fill=color)
        elif end_y != start_y:
            draw.polygon([
                (end_x, end_y),
                (end_x - 5, end_y - 8),
                (end_x + 5, end_y - 8)
            ], fill=color)

    # 1. Left Box: User / SecOps Analyst
    draw_box(40, 220, 180, 110, (243, 232, 255), (192, 132, 252), "SecOps Operator", "(Browser Client)\nAdmin Ammar\nhackAMR Credentials")

    # Arrow from User to UI
    draw_arrow(220, 275, 270, 275)

    # 2. Main Web UI Box
    draw_box(270, 195, 220, 160, (224, 242, 254), (56, 189, 248), "Sentinel SOC Web UI", "React 19 + Tailwind CSS\nVite Modular SPA\nDual Traffic Modes\nSequential Queue (500ms)")

    # 3. Middle Engines (3 Branches)
    # Branch 1 (Top): Native Socket Sniffer
    draw_box(550, 80, 260, 110, (254, 237, 213), (251, 146, 60), "Native OS Socket Bridge", "Node.js 22 + Express 5\nReal TCP Netstat Sniffer\nSSE Push Stream (/api/stream)")
    
    # Branch 2 (Middle): Netfilter Matcher & IDS
    draw_box(550, 220, 260, 110, (254, 237, 213), (251, 146, 60), "Netfilter & Heuristic IDS", "Priority Policy Evaluation\nSYN Flood Detection\nPort Reconnaissance Analysis")

    # Branch 3 (Bottom): Live Adversary Simulator
    draw_box(550, 360, 260, 110, (254, 237, 213), (251, 146, 60), "Attack Simulation Engine", "TCP SYN Flood DDoS Vector\nRate Acceleration (350ms)\nInteractive Scenario Trigger")

    # Arrows from Web UI to the 3 Engines
    draw_arrow(490, 250, 550, 135)
    draw_arrow(490, 275, 550, 275)
    draw_arrow(490, 300, 550, 415)

    # 4. Right Outputs & Storage (3 Boxes)
    # Right 1 (Top): MySQL Database
    draw_box(870, 80, 280, 110, (220, 252, 231), (74, 222, 128), "MySQL Database Store", "Database: firewall_db\nTables: firewall_rules, logs\nPersistent Hits & Bandwidth")

    # Right 2 (Middle): Traffic Feed & Action
    draw_box(870, 220, 280, 110, (220, 252, 231), (74, 222, 128), "Deterministic Enforcement", "Real-time ALLOW / DROP\nContinuous Terminal Feed\n1-Click Threat Auto-Block")

    # Right 3 (Bottom): Topology Mesh & AI Analyst
    draw_box(870, 360, 280, 110, (220, 252, 231), (74, 222, 128), "Visual Mesh & AI Forensics", "Draggable Topology Graph\nBézier Curve Calculations\nSentinel AI Copilot (Gemini)")

    # Arrows from Engines to Outputs
    draw_arrow(810, 135, 870, 135)
    draw_arrow(810, 275, 870, 275)
    draw_arrow(810, 415, 870, 415)

    # Border around entire canvas
    draw.rectangle([0, 0, width - 1, height - 1], outline=(226, 232, 240), width=1)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG", dpi=(300, 300))
    print(f"System architecture diagram saved to: {output_path}")

if __name__ == '__main__':
    create_system_architecture_diagram(r"c:\Users\ammar\OneDrive\Desktop\Firewall\reports\system_architecture.png")
