const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/ghait/OneDrive/Desktop/pfe/pfe/project_pfe/frontend/src/pages';

function rep(file, rules) {
  let p = path.join(dir, file);
  let c = fs.readFileSync(p, 'utf8');
  rules.forEach(([s, r]) => {
    c = c.split(s).join(r);
  });
  fs.writeFileSync(p, c, 'utf8');
}

rep('Users.jsx', [
  ['>Username<', '>{t("users.username")}<'],
  ['>Email<', '>{t("users.email")}<'],
  ['>Role<', '>{t("users.role")}<'],
  ['>Created<', '>{t("users.created")}<'],
  ['>Cancel<', '>{t("common.cancel")}<'],
  ['>Actions<', '>{t("common.actions")}<'],
  ['>Edit<', '>{t("common.edit")}<'],
  ['>Delete<', '>{t("common.delete")}<'],
  ['>Manage system users and roles<', '>{t("users.manage")}<'],
  ['>No users found<', '>{t("users.noUsers")}<']
]);

rep('Audit.jsx', [
  ['>Entity<', '>{t("audit.entity")}<'],
  ['>All entities<', '>{t("audit.allEntities")}<'],
  ['>Offers<', '>{t("nav.offers")}<'],
  ['>Profiles<', '>{t("nav.profiles")}<'],
  ['>Options<', '>{t("nav.options")}<'],
  ['>Simulations<', '>{t("nav.simulation")}<'],
  ['>Action<', '>{t("audit.action")}<'],
  ['>All actions<', '>{t("audit.allActions")}<'],
  ['>Create<', '>{t("common.create")}<'],
  ['>Update<', '>{t("common.edit")}<'],
  ['>Delete<', '>{t("common.delete")}<'],
  ['>Compare<', '>{t("audit.simulateCompare")}<'],
  ['>Recommend<', '>{t("audit.simulateRecommend")}<'],
  ['>Batch<', '>{t("audit.simulateBatch")}<'],
  ['>Login<', '>{t("nav.login") || "Login"}<'], 
  ['>From<', '>{t("audit.from")}<'],
  ['>To<', '>{t("audit.to")}<']
]);

rep('Scenarios.jsx', [
  ['>Status<', '>{t("scenarios.status")}<'],
  ['>Draft<', '>{t("common.draft")}<'],
  ['>Active<', '>{t("common.active")}<'],
  ['>Archived<', '>{t("common.inactive")}<'],
  ['>Cancel<', '>{t("common.cancel")}<'],
  ['>Close<', '>{t("scenarios.close")}<'],
  ['>Offer<', '>{t("scenarios.offer")}<'],
  ['>Cost<', '>{t("scenarios.cost")}<'],
  ['>Score<', '>{t("scenarios.score")}<'],
  ['>Rank<', '>{t("scenarios.rank")}<'],
  ['>Metric<', '>{t("scenarios.metric")}<'],
  ['>Value<', '>{t("scenarios.value")}<'],
  ['>Profile<', '>{t("scenarios.profile")}<'],
  ['>Budget<', '>{t("scenarios.budget")}<']
]);

rep('Compare.jsx', [
  ['>Ready to compare<', '>{t("compare.readyToCompare")}<'],
  ['>Metric<', '>{t("compare.metric")}<'],
  ['>Recommendation<', '>{t("compare.recommendation")}<']
]);

rep('Dashboard.jsx', [
  ['>No data<', '>{t("common.noData")}<']
]);

console.log("Done");
