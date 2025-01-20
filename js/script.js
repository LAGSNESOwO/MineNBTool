// ========== 全局数据：存储用户自定义的附魔 ==========
let userEnchants = [];

// 页面加载时，从 localStorage 读取
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("customEnchants");
  if (saved) {
    userEnchants = JSON.parse(saved);
  } else {
    userEnchants = [];
  }
  // 构建自定义附魔UI
  buildUserEnchantsUI();
});

// ========== 导航抽屉逻辑 ==========
function openNav() {
  document.getElementById("navDrawer").classList.add("open");
}
function closeNav() {
  document.getElementById("navDrawer").classList.remove("open");
}
function showPage(pageId) {
  // 隐藏所有 page-content
  const pages = document.querySelectorAll(".page-content");
  pages.forEach(page => page.classList.remove("active"));
  // 显示对应页面
  document.getElementById(pageId).classList.add("active");
  // 关闭导航抽屉
  closeNav();
}

// ========== 卡片折叠逻辑 ==========
function toggleCollapse(contentId) {
  const content = document.getElementById(contentId);
  content.classList.toggle("hidden");
}

// ========== 全选/反选逻辑 ==========
function toggleSelectAll() {
  const enchantCardContent = document.getElementById('enchantCardContent');
  const checkboxes = enchantCardContent.querySelectorAll('input[type="checkbox"]');

  // 判断当前是否全部已选中
  let allChecked = true;
  checkboxes.forEach(chk => {
    if (!chk.checked) {
      allChecked = false;
    }
  });

  // 如果全选，则反选；如果有未选中，则全选
  checkboxes.forEach(chk => {
    chk.checked = !allChecked;
  });
}

// ========== 自定义附魔添加/删除逻辑 ==========
// 打开添加附魔模态
function openAddEnchantModal() {
  document.getElementById("addEnchantModal").classList.add("active");
}
// 关闭添加附魔模态
function closeAddEnchantModal() {
  document.getElementById("addEnchantModal").classList.remove("active");
}
// 确认添加
function confirmAddEnchant() {
  const name = document.getElementById("customEnchantName").value.trim();
  const id = document.getElementById("customEnchantId").value.trim();

  if (!name || !id) {
    alert("展示名称和附魔ID都不能为空！");
    return;
  }

  // 添加到 userEnchants 数组
  userEnchants.push({ name, id });
  // 存到 localStorage
  localStorage.setItem("customEnchants", JSON.stringify(userEnchants));

  // 关闭模态框
  closeAddEnchantModal();
  // 清空输入框
  document.getElementById("customEnchantName").value = "";
  document.getElementById("customEnchantId").value = "";

  // 刷新UI
  buildUserEnchantsUI();
}

// 删除某自定义附魔
function deleteEnchant(index) {
  userEnchants.splice(index, 1);
  // 更新 localStorage
  localStorage.setItem("customEnchants", JSON.stringify(userEnchants));
  // 刷新UI
  buildUserEnchantsUI();
}

// 构建自定义附魔UI
function buildUserEnchantsUI() {
  const container = document.getElementById("userEnchantContainer");
  container.innerHTML = ""; // 先清空

  userEnchants.forEach((enchant, index) => {
    // 为每个附魔构建一个带复选框的行
    const div = document.createElement("div");
    div.style.marginBottom = "8px";

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = enchant.id; // 将 enchant.id 作为附魔实际值

    label.appendChild(checkbox);
    label.append(` ${enchant.name} (${enchant.id})`);

    // 删除按钮
    const delBtn = document.createElement("button");
    delBtn.innerText = "删";
    delBtn.className = "delete-button";
    delBtn.onclick = () => deleteEnchant(index);

    div.appendChild(label);
    div.appendChild(delBtn);

    container.appendChild(div);
  });
}

// ========== 附魔ID映射 (旧版本需要数值) ==========
// 如果这里找不到，就会在旧版本模式下忽略
const oldEnchantIDs = {
  "minecraft:protection": 0,
  "minecraft:fire_protection": 1,
  "minecraft:feather_falling": 2,
  "minecraft:blast_protection": 3,
  "minecraft:projectile_protection": 4,
  "minecraft:respiration": 5,
  "minecraft:aqua_affinity": 6,
  "minecraft:thorns": 7,
  "minecraft:depth_strider": 8,
  "minecraft:sharpness": 16,
  "minecraft:smite": 17,
  "minecraft:bane_of_arthropods": 18,
  "minecraft:knockback": 19,
  "minecraft:fire_aspect": 20,
  "minecraft:looting": 21,
  "minecraft:efficiency": 32,
  "minecraft:silk_touch": 33,
  "minecraft:unbreaking": 34,
  "minecraft:fortune": 35,
  "minecraft:power": 48,
  "minecraft:punch": 49,
  "minecraft:flame": 50,
  "minecraft:infinity": 51,
  "minecraft:luck_of_the_sea": 61,
  "minecraft:lure": 62
};

// ========== 生成命令逻辑 ==========
function generateCommand() {
  // 物品ID
  const itemID = document.getElementById("itemID").value.trim() || "minecraft:diamond_sword";
  // 游戏版本
  const gameVersion = document.querySelector('input[name="gameVersion"]:checked').value;
  // 新版用 Enchantments，旧版用 ench
  const enchantTag = (gameVersion === "old") ? "ench" : "Enchantments";

  // 获取所有选中的复选框（包含自定义附魔）
  const enchantCheckboxes = document.querySelectorAll('#enchantCardContent input[type="checkbox"]:checked');
  if (enchantCheckboxes.length === 0) {
    alert("请至少选择一种附魔！");
    return;
  }

  // 获取附魔等级
  const level = document.getElementById("enchantmentLevel").value.trim() || "1";
  // 自定义名称及颜色
  const customName = document.getElementById("customName").value.trim();
  const nameColor = document.getElementById("nameColor").value; // #rrggbb

  // 生成附魔数组
  const enchantmentsArray = [];
  enchantCheckboxes.forEach(chk => {
    const enchantKey = chk.value; // e.g. "minecraft:sharpness"
    if (gameVersion === "old") {
      // 旧版本，需要数字ID
      if (oldEnchantIDs[enchantKey] !== undefined) {
        enchantmentsArray.push(`{id:${oldEnchantIDs[enchantKey]},lvl:${level}}`);
      } else {
        console.warn("旧版本不支持或未配置映射: " + enchantKey);
      }
    } else {
      // 新版本
      enchantmentsArray.push(`{id:"${enchantKey}",lvl:${level}}`);
    }
  });

  // 若在旧版本模式下选了一堆不支持，则可能为空
  if (enchantmentsArray.length === 0) {
    alert("在旧版本模式下，你选的附魔都不被支持或未配置映射。");
    return;
  }

  const enchantmentsNBT = enchantmentsArray.join(",");

  // 自定义名称显示
  let displayNBT = "";
  if (customName !== "") {
    if (gameVersion === "old") {
      // 旧版命令
      displayNBT = `,display:{Name:"${customName}"}`;
    } else {
      // 新版，使用 JSON 语法
      displayNBT = `,display:{Name:'{"text":"${customName}","color":"${nameColor}"}'}`;
    }
  }

  // 组合命令
  let command;
  if (gameVersion === "old") {
    // 旧版本常见格式: /give @p diamond_sword 1 0 {ench:[{id:16,lvl:5}],display:{Name:"XX"}}
    const baseItem = itemID.includes("minecraft:") ? itemID.split(":")[1] : itemID;
    command = `/give @p ${baseItem} 1 0 {${enchantTag}:[${enchantmentsNBT}]${displayNBT}}`;
  } else {
    // 新版本: /give @p minecraft:diamond_sword{Enchantments:[{id:"minecraft:xxx",lvl:5}]} 1
    command = `/give @p ${itemID}{${enchantTag}:[${enchantmentsNBT}]${displayNBT}}`;
  }

  document.getElementById("result").value = command;
}

// ========== 复制命令逻辑 ==========
function copyCommand() {
  const cmdText = document.getElementById("result").value.trim();
  if (!cmdText) {
    alert("没有可复制的命令，请先生成命令。");
    return;
  }

  navigator.clipboard.writeText(cmdText).then(() => {
    showModal();
  }, err => {
    console.error("复制失败: ", err);
  });
}

// 显示 / 关闭“复制成功”模态窗
function showModal() {
  document.getElementById("copyModal").classList.add("active");
}
function closeModal() {
  document.getElementById("copyModal").classList.remove("active");
}
